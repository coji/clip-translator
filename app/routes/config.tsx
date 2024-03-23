import { getFormProps, getInputProps, useForm } from '@conform-to/react'
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
import { Button, Input, Label, Stack } from '~/components/ui'

const schema = z.object({
  anthropic_api_key: z.string().max(200),
})

export const clientLoader = async (_: ClientLoaderFunctionArgs) => {
  const appConfig = await loadAppConfig()
  return { appConfig }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  // 保存
  saveAppConfig(submission.value)

  return redirect('/')
}

export default function ConfigPage() {
  const { appConfig } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { anthropic_api_key: appConfig?.anthropic_api_key ?? '' },
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
        </div>

        <Button>Save</Button>
      </Form>
    </Stack>
  )
}
