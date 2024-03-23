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
import { useEffect } from 'react'
import { z } from 'zod'
import { zx } from 'zodix'
import { loadAppConfig } from '~/commands'
import { Button, HStack, Stack, Textarea } from '~/components/ui'
import { useClaude3 } from '~/services/claude3'

const schema = z.object({
  source: z.string(),
})

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
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
  })
  const { getAnswer, result } = useClaude3({
    apiKey: config.anthropic_api_key,
    systemPrompt: config.system_prompt,
  })

  console.log({ source, config })
  useEffect(() => {
    if (source) {
      console.log('getAnswer', source)
      getAnswer(source)
    }
  }, [source, getAnswer])

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

        <Textarea readOnly className="flex-1">
          {result}
        </Textarea>
      </HStack>

      <Link to="/config" className="text-xs text-primary underline">
        Config
      </Link>
    </Stack>
  )
}
