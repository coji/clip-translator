import {
  Link,
  useFetcher,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  HStack,
  Spinner,
  Stack,
  Textarea,
} from '~/components/ui'
import { useDebounce } from '~/hooks/useDebounce'
import { cn } from '~/libs/utils'
import { requireApiKey } from '~/services/config.client'
import { translate } from '~/services/translate'

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  const config = await requireApiKey()
  return { source, config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const config = await requireApiKey()
  const { source } = await zx.parseForm(request, { source: z.string() })

  return await translate({
    apiKey: config.anthropic_api_key,
    systemPrompt: config.system_prompt,
    model: 'claude-3-haiku-20240307',
    source,
  })
}

export default function IndexPage() {
  const { source } = useLoaderData<typeof clientLoader>()
  const fetcher = useFetcher<typeof clientAction>()
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 500)
  const actionData = fetcher.data
  const isSubmitting = fetcher.state === 'submitting'

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (source) fetcher.submit({ source }, { method: 'POST' })
  }, [source])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (debouncedInput)
      fetcher.submit({ source: debouncedInput }, { method: 'POST' })
  }, [debouncedInput])

  return (
    <Stack className="gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2" key={source}>
        <fetcher.Form className="flex flex-col gap-2" method="POST">
          <Textarea
            className="flex-1"
            placeholder="Enter a source text..."
            name="source"
            defaultValue={source}
            onChange={(e) => setInput(e.target.value)}
          />

          {actionData?.type === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>System Error</AlertTitle>
              <AlertDescription className="line-clamp-3">
                {actionData.error}
              </AlertDescription>
            </Alert>
          )}
        </fetcher.Form>

        <div className="relative grid grid-cols-1 place-items-center">
          <Textarea
            className={cn('absolute inset-0', isSubmitting && 'bg-slate-100')}
            readOnly
            value={`${actionData?.type === 'success' ? actionData.destinationText : ''}${isSubmitting ? '...' : ''}`}
          />

          <Spinner show={isSubmitting} />
        </div>
      </div>

      <HStack className="items-center text-xs">
        <Link to="/config" className=" text-primary underline">
          Config
        </Link>
        <div className="flex-1" />
        {actionData?.type === 'success' && (
          <HStack className="items-center gap-1">
            <span>LLMコスト</span>
            <Badge className="py-0">
              {(actionData?.cost * 151).toFixed(2)} 円
            </Badge>
          </HStack>
        )}
      </HStack>
    </Stack>
  )
}
