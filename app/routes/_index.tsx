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

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  const config = await requireApiKey()
  return { source, config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const config = await requireApiKey()
  const { source } = await zx.parseForm(request, { source: z.string() })
  console.log('clientAction', source)

  try {
    const response = await callClaude3({
      apiKey: config.anthropic_api_key,
      system: config.system_prompt,
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [{ role: 'user', content: source }],
    })

    return {
      error: null,
      response: response.content[0].text,
    }
  } catch (e) {
    let errorMessage = ''
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}, ${e.stack}`
    } else {
      errorMessage = String(e)
    }
    return { error: errorMessage, response: undefined }
  }
}

export default function IndexPage() {
  const { source } = useLoaderData<typeof clientLoader>()
  const fetcher = useFetcher<typeof clientAction>()
  const actionData = fetcher.data

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (source) {
      setTimeout(() => {
        console.log(source)
        fetcher.submit({ source }, { method: 'POST' })
      }, 100)
    }
  }, [source])

  return (
    <Stack className="gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2" key={source}>
        <fetcher.Form className="flex flex-col gap-2" method="POST">
          <Textarea
            className="flex-1"
            placeholder="Enter a source text..."
            name="source"
            defaultValue={source}
          />

          {actionData?.error && (
            <Alert variant="destructive">
              <AlertTitle>System Error</AlertTitle>
              <AlertDescription className="line-clamp-3">
                {actionData.error}
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
