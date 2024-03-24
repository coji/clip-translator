import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import { Button, Skeleton, Stack, Textarea } from '~/components/ui'
import { callClaude3 } from '~/services/claude3'
import { requireApiKey } from '~/services/config.client'

const schema = z.object({
  source: z.string(),
})

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  const config = await requireApiKey()
  return { source, config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const config = await requireApiKey()
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return { response: null, lastResult: submission.reply() }
  }

  const response = await callClaude3({
    apiKey: config.anthropic_api_key,
    system: config.system_prompt,
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [{ role: 'user', content: submission.value.source }],
  })
  return { response, lastResult: submission.reply() }
}

export default function IndexPage() {
  const { source } = useLoaderData<typeof clientLoader>()
  const actionData = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    id: source,
    lastResult: actionData?.lastResult,
    defaultValue: { source },
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })
  const navigation = useNavigation()

  return (
    <Stack className="gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2" key={source}>
        <Form
          className="flex flex-col gap-2"
          method="POST"
          {...getFormProps(form)}
        >
          <Textarea
            className="flex-1"
            placeholder="Enter a source text..."
            {...getTextareaProps(fields.source)}
          />

          <Button type="submit" className="w-full">
            Translate
          </Button>
        </Form>

        {navigation.state === 'submitting' ? (
          <Skeleton />
        ) : (
          <Textarea readOnly value={JSON.stringify(actionData?.response)} />
        )}
      </div>

      <Link to="/config" className="text-xs text-primary underline">
        Config
      </Link>
    </Stack>
  )
}
