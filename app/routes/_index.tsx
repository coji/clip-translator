import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { z } from 'zod'
import { zx } from 'zodix'
import { loadAppConfig } from '~/commands'
import { Button, HStack, Stack, Textarea } from '~/components/ui'
import { useOpenAI } from '~/services/openai'

const schema = z.object({
  source: z.string(),
})

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  console.log('clientLoader', { source })
  const config = await loadAppConfig()
  if (!config) {
    return redirect('/config')
  }
  return { source, config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return submission.reply()
  }
  return null
}

export default function IndexPage() {
  const { source, config } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    lastResult: lastResult,
    defaultValue: { source },
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    onSubmit: (event, { submission }) => {
      if (submission?.status === 'success') {
        getAnswer(submission.value.source)
      }
    },
  })

  const { getAnswer, result } = useOpenAI({
    apiKey: config.openai_api_key,
    organization: config.openai_organization,
    systemPrompt: config.system_prompt,
  })

  return (
    <Stack>
      <HStack className="flex-1">
        <Form
          className="flex flex-1 flex-col gap-4"
          method="GET"
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

        <Textarea readOnly className="flex-1" value={result ?? ''} />
      </HStack>

      <Link to="/config" className="text-xs text-primary underline">
        Config
      </Link>
    </Stack>
  )
}
