import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  Link,
  useFetcher,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { useEffect } from 'react'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Skeleton,
  Stack,
  Textarea,
} from '~/components/ui'
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
    return { lastResult: submission.reply() }
  }

  try {
    const response = await callClaude3({
      apiKey: config.anthropic_api_key,
      system: config.system_prompt,
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: submission.value.source }],
    })

    return {
      response: response.content[0].text,
      lastResult: submission.reply(),
    }
  } catch (e) {
    let errorMessage = ''
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}, ${e.stack}`
    } else {
      errorMessage = String(e)
    }
    return {
      lastResult: submission.reply({ formErrors: [errorMessage] }),
    }
  }
}

export default function IndexPage() {
  const { source } = useLoaderData<typeof clientLoader>()
  const fetcher = useFetcher<typeof clientAction>()
  const actionData = fetcher.data
  const [form, fields] = useForm({
    id: source,
    lastResult: actionData?.lastResult,
    defaultValue: { source },
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (source) {
      form.validate()
      fetcher.submit(form.id, { method: 'POST' })
    }
  }, [source])

  return (
    <Stack className="gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2" key={source}>
        <fetcher.Form
          className="flex flex-col gap-2"
          method="POST"
          {...getFormProps(form)}
        >
          <Textarea
            className="flex-1"
            placeholder="Enter a source text..."
            {...getTextareaProps(fields.source)}
            key={fields.source.key}
          />

          {fields.source.errors && (
            <div className="text-destructive">{fields.source.errors}</div>
          )}

          {form.errors && (
            <Alert variant="destructive">
              <AlertTitle>System Error</AlertTitle>
              <AlertDescription className="line-clamp-3">
                {form.errors}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={fetcher.state === 'submitting'}
          >
            Translate
          </Button>
        </fetcher.Form>

        {fetcher.state === 'submitting' ? (
          <Skeleton />
        ) : (
          <Textarea readOnly value={actionData?.response} />
        )}
      </div>

      <div>
        <Link to="/config" className="text-xs text-primary underline">
          Config
        </Link>
      </div>
    </Stack>
  )
}
