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
import { translate } from '~/routes/_index/functions/translate'
import { Models } from '~/services/claude3'
import { requireApiKey, saveConfig } from '~/services/config.client'
import { ModelSelector } from './components/model-selector'

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  const config = await requireApiKey()
  return { source, config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const config = await requireApiKey()
  const { model, source } = await zx.parseForm(request, {
    model: z.enum(['opus', 'sonnet', 'haiku']),
    source: z.string(),
  })

  await saveConfig({ ...config, model })

  return await translate({
    apiKey: config.anthropic_api_key,
    systemPrompt: config.system_prompt,
    model: Models[model],
    source: source,
  })
}

export default function IndexPage() {
  const { source, config } = useLoaderData<typeof clientLoader>()
  const [model, setModel] = useState<string>(config.model)
  const fetcher = useFetcher<typeof clientAction>()
  const [input, setInput] = useState('')
  const debouncedInput = useDebounce(input, 500)
  const actionData = fetcher.data
  const isSubmitting = fetcher.state === 'submitting'

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (source) fetcher.submit({ model, source }, { method: 'POST' })
  }, [source])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (debouncedInput)
      fetcher.submit({ model, source: debouncedInput }, { method: 'POST' })
  }, [debouncedInput])

  return (
    <fetcher.Form
      className="grid min-h-screen grid-cols-1 bg-slate-100 p-2"
      method="POST"
    >
      <Stack className="gap-2">
        <div className="grid flex-1 grid-cols-2 gap-2" key={source}>
          {/* source text */}
          <div className="flex flex-col gap-2">
            <input type="hidden" value={model} />
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
          </div>

          {/* translated text */}
          <div className="relative grid grid-cols-1 place-items-center">
            <Textarea
              className={cn('absolute inset-0', isSubmitting && 'bg-slate-100')}
              readOnly
              value={`${actionData?.type === 'success' ? actionData.destinationText : ''}${isSubmitting ? '...' : ''}`}
            />

            <Spinner show={isSubmitting} />
          </div>
        </div>

        {/* footer menus */}
        <HStack className="items-center text-xs">
          {/*  config */}
          <Link to="/config" className=" text-primary underline">
            Config
          </Link>

          <div className="flex-1" />

          <HStack className="items-center gap-2">
            {/* pricing */}
            {actionData?.type === 'success' && (
              <HStack className="items-center gap-1">
                <span>LLMコスト</span>
                <Badge className="py-0">
                  {(actionData?.cost * 151).toFixed(2)} 円
                </Badge>
              </HStack>
            )}

            <HStack className="items-center gap-1">
              <span>Model</span>
              <ModelSelector
                className="h-auto py-1 text-xs focus:ring-offset-0"
                defaultValue={model}
                onChangeValue={(newModel) => {
                  setModel(newModel)
                  if (input) {
                    fetcher.submit(
                      { model: newModel, source: input },
                      { method: 'POST' },
                    )
                  }
                }}
              />
            </HStack>
          </HStack>
        </HStack>
      </Stack>
    </fetcher.Form>
  )
}
