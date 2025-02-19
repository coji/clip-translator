import { useEffect, useState } from 'react'
import { href, Link, useFetcher } from 'react-router'
import { match } from 'ts-pattern'
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
import { requireApiKey, saveConfig } from '~/services/config.client'
import { ModelIdSchema, Models } from '~/services/models'
import type { Route } from './+types/route'
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
import { translateByGemini } from './functions'

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const { source } = zx.parseQuery(request, { source: z.string().optional() })
  const config = await requireApiKey()
  return { source, config }
}

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const config = await requireApiKey()
  const { model, source } = await zx.parseForm(request, {
    model: ModelIdSchema,
    source: z.string(),
  })

  await saveConfig({ ...config, model })

  const startTime = Date.now()
  const response = await match(Models[model])
    .with({ provider: 'gemini' }, async (model) => {
      return await translateByGemini({
        apiKey: config.gemini_api_key,
        systemPrompt: config.system_prompt,
        source,
        model: model.id,
      })
    })
    .exhaustive()
  const finishTime = Date.now()

  return { response, duration: finishTime - startTime }
}

export default function IndexPage({
  loaderData: { source, config },
}: Route.ComponentProps) {
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
              className="p-2"
              placeholder="Enter a source text..."
              name="source"
              defaultValue={source}
              onChange={(e) => setInput(e.target.value)}
            />
          </SourcePane>

          <DistinationPane className="relative">
            <Stack className="absolute inset-0">
              <Textarea
                readOnly
                className={cn(
                  'flex-1 p-2',
                  isSubmitting && 'bg-slate-50 text-muted-foreground',
                )}
                value={`${
                  actionData?.response.type === 'success'
                    ? actionData.response.destinationText
                    : ''
                }${isSubmitting ? '...' : ''}`}
              />

              {actionData?.response.type === 'error' && (
                <Alert variant="destructive">
                  <AlertTitle>System Error</AlertTitle>
                  <AlertDescription className="line-clamp-3">
                    {actionData?.response.error}
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
              <Link to={href('/config')}>Config</Link>
            </Button>
          </FooterMenuItem>

          <FooterSpacer />

          {actionData?.response.type === 'success' && (
            <>
              <FooterMenuItem>
                <span className="whitespace-nowrap">処理時間</span>
                <Badge variant="destructive" className="whitespace-nowrap py-0">
                  {Math.trunc(actionData.duration / 1000)} <small>秒</small>
                </Badge>
              </FooterMenuItem>

              {actionData.response.inputTokens && (
                <FooterMenuItem>
                  <span className="whitespace-nowrap">入力</span>
                  <Badge variant="secondary" className="whitespace-nowrap py-0">
                    {actionData.response.inputTokens.toLocaleString()}
                    <small>トークン</small>
                  </Badge>
                </FooterMenuItem>
              )}

              {actionData.response.outputTokens && (
                <FooterMenuItem>
                  <span className="whitespace-nowrap">出力</span>
                  <Badge variant="secondary" className="whitespace-nowrap py-0">
                    {actionData.response.outputTokens.toLocaleString()}
                    <small>トークン</small>
                  </Badge>
                </FooterMenuItem>
              )}

              {actionData?.response.cost && (
                <FooterMenuItem>
                  <span className="whitespace-nowrap">LLMコスト</span>
                  <Badge className="whitespace-nowrap py-0">
                    {(actionData.response.cost * 155).toFixed(2)}{' '}
                    <small>円</small>
                  </Badge>
                </FooterMenuItem>
              )}
            </>
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
