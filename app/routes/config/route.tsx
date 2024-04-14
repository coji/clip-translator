import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  useInputControl,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  Form,
  Link,
  redirect,
  useActionData,
  useBlocker,
  useLoaderData,
  type ClientActionFunctionArgs,
  type ClientLoaderFunctionArgs,
} from '@remix-run/react'
import { $path } from 'remix-routes'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '~/components/ui'
import { ModelIdSchema, Models } from '~/services/claude3'
import { loadConfig, saveConfig } from '~/services/config.client'
import {
  BlockerAlert,
  ConfigContent,
  ConfigField,
  ConfigFooter,
  ConfigHeader,
  ConfigPageLayout,
  ConfigTitle,
} from './components/Layout'

const schema = z.object({
  anthropic_api_key: z.string().max(200),
  system_prompt: z.string().max(100000),
  model: ModelIdSchema,
})

export const clientLoader = async (_: ClientLoaderFunctionArgs) => {
  const config = await loadConfig()
  return { config }
}

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  await saveConfig(submission.value)
  toast.success('Configurations saved successfully')

  return redirect($path('/'))
}

export default function ConfigPage() {
  const { config } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { ...config },
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.dirty && currentLocation.pathname !== nextLocation.pathname,
  )
  const modelControl = useInputControl(fields.model)

  return (
    <ConfigPageLayout>
      <Form method="POST" {...getFormProps(form)} />
      <ConfigHeader>
        <ConfigTitle>Configurations</ConfigTitle>
      </ConfigHeader>

      <ConfigContent>
        {/* anthropic  */}
        <ConfigField>
          <Label htmlFor={fields.anthropic_api_key.id}>Anthropic API Key</Label>
          <Input
            {...getInputProps(fields.anthropic_api_key, {
              type: 'password',
            })}
          />
          <div
            id={fields.anthropic_api_key.errorId}
            className="text-sm text-destructive"
          >
            {fields.anthropic_api_key.errors}
          </div>
        </ConfigField>

        <ConfigField>
          <Label htmlFor={fields.model.id}>Model</Label>
          <Select
            defaultValue={fields.model.initialValue}
            onValueChange={modelControl.change}
            onOpenChange={(open) => {
              if (!open) modelControl.blur()
            }}
          >
            <SelectTrigger
              form={form.id}
              name={fields.model.name}
              id={fields.model.id}
              value={fields.model.value}
              className="capitalize"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(Models).map((modelId) => (
                <SelectItem
                  key={modelId}
                  value={modelId}
                  className="capitalize"
                >
                  {modelId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div id={fields.model.errorId} className="text-sm text-destructive">
            {fields.model.errors}
          </div>
        </ConfigField>

        <ConfigField className="flex-1">
          <Label
            className="block"
            id={fields.system_prompt.descriptionId}
            htmlFor={fields.system_prompt.id}
          >
            System Prompt
          </Label>
          <Textarea
            className="flex-1"
            {...getTextareaProps(fields.system_prompt)}
          />
          <div
            id={fields.system_prompt.errorId}
            className="text-sm text-destructive"
          >
            {fields.system_prompt.errors}
          </div>
        </ConfigField>
      </ConfigContent>

      <ConfigFooter>
        <Button type="button" variant="ghost" asChild>
          <Link to={$path('/')}>Cancel</Link>
        </Button>
        <Button form={form.id} type="submit" disabled={!form.dirty}>
          Save
        </Button>
      </ConfigFooter>

      {blocker.state === 'blocked' && (
        <BlockerAlert>
          <div className="flex-1">
            Are you sure you want to leave without saving?
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => blocker.reset()}
          >
            Stay
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => blocker.proceed()}
          >
            Continue
          </Button>
        </BlockerAlert>
      )}
    </ConfigPageLayout>
  )
}
