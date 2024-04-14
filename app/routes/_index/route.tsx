import {
  Link,
  useFetcher,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { z } from 'zod'
import { zx } from 'zodix'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Spinner,
  Stack,
  Textarea,
} from '~/components/ui'
import { useDebounce } from '~/hooks/useDebounce'
import { cn } from '~/libs/utils'
import { Models } from '~/services/claude3'
import { requireApiKey, saveConfig } from '~/services/config.client'
import {
  DistinationPane,
  FooterMenu,
  FooterMenuItem,
  FooterSpacer,
  IndexLayout,
  ModelSelect,
  SourcePane,
  TranslationPane,
} from './components'
import { translate } from './functions'

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
    <IndexLayout asChild>
      <fetcher.Form method="POST">
        <TranslationPane key={source}>
          <SourcePane>
            <Textarea
              placeholder="Enter a source text..."
              name="source"
              defaultValue={source}
              onChange={(e) => setInput(e.target.value)}
            />
          </SourcePane>

          <DistinationPane className="relative">
            <Stack className="absolute inset-0">
              <ReactMarkdown
                className={cn(
                  'flex-1 overflow-auto rounded bg-background p-2',
                  isSubmitting && 'bg-slate-50 text-muted-foreground',
                )}
              >
                {`${
                  actionData?.type === 'success'
                    ? actionData.destinationText
                    : ''
                }${isSubmitting ? '...' : ''}`}
              </ReactMarkdown>

              {actionData?.type === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>System Error</AlertTitle>
                  <AlertDescription className="line-clamp-3">
                    {actionData.error}
                  </AlertDescription>
                </Alert>
              )}
            </Stack>

            <Spinner
              className="absolute inset-0 z-10 m-auto"
              show={isSubmitting}
            />
          </DistinationPane>
        </TranslationPane>

        <FooterMenu>
          <FooterMenuItem>
            <Button variant="link" size="xs" asChild>
              <Link to="/config">Config</Link>
            </Button>
          </FooterMenuItem>

          <FooterSpacer />

          {actionData?.type === 'success' && (
            <FooterMenuItem>
              <span className="whitespace-nowrap">LLMコスト</span>
              <Badge className="whitespace-nowrap py-0">
                {(actionData?.cost * 151).toFixed(2)} <small>円</small>
              </Badge>
            </FooterMenuItem>
          )}

          <FooterMenuItem>
            <span>Model</span>
            <ModelSelect
              name="model"
              value={model}
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
          </FooterMenuItem>
        </FooterMenu>
      </fetcher.Form>
    </IndexLayout>
  )
}
