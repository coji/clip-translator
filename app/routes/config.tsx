import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { z } from 'zod'
import { loadAppConfig, saveAppConfig } from '~/commands'
import { Button, Input, Label, Stack, Textarea } from '~/components/ui'

const schema = z.object({
  anthropic_api_key: z.string().max(200),
  system_prompt: z.string().max(100000),
})

export const clientLoader = async (_: ClientLoaderFunctionArgs) => {
  const config = await loadAppConfig()
  return { config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  // 保存
  await saveAppConfig(submission.value)

  return redirect('/')
}

export default function ConfigPage() {
  const { config } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      anthropic_api_key: config?.anthropic_api_key ?? '',
      system_prompt:
        config?.system_prompt ??
        `あなたは言語翻訳AIアシスタントです。以下の手順に従って、入力されたテキストを翻訳してください。

手順:

入力されたテキストの言語を判定してください。日本語の場合は手順2に、英語の場合は手順3に進んでください。
日本語から英語への翻訳を行ってください。翻訳結果を"英訳:"と表示した後に出力してください。
英語から日本語への翻訳を行ってください。翻訳結果を"和訳:"と表示した後に出力してください。
入力されたテキストが日本語でも英語でもない場合は、"入力された言語を判定できませんでした。日本語または英語で入力してください。"と出力してください。
翻訳を開始します。

出力例:
入力:
Hello, how are you doing today?

和訳:
こんにちは、今日はどうですか?

入力:
こんばんは。今日はとても暑いですね。

英訳:
Good evening. It's very hot today, isn't it?`,
    },
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })

  return (
    <Stack asChild>
      <Form method="POST" {...getFormProps(form)}>
        <h1>App Config</h1>

        <div>
          <Label htmlFor={fields.anthropic_api_key.id}>Anthropic API Key</Label>
          <Input
            {...getInputProps(fields.anthropic_api_key, { type: 'text' })}
          />
          <div
            className="text-destructive"
            id={fields.anthropic_api_key.errorId}
          >
            {fields.anthropic_api_key.errors}
          </div>

          <Label htmlFor={fields.system_prompt.id}>System Prompt</Label>
          <Textarea {...getTextareaProps(fields.system_prompt)} />
          <div className="text-destructive" id={fields.system_prompt.errorId}>
            {fields.system_prompt.errors}
          </div>
        </div>

        <Button className="w-full">Save</Button>
      </Form>
    </Stack>
  )
}
