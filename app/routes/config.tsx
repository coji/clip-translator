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
import { z } from 'zod'
import {
  Button,
  HStack,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  Textarea,
} from '~/components/ui'
import { Models } from '~/services/claude3'
import { loadConfig, saveConfig } from '~/services/config.client'

const schema = z.object({
  anthropic_api_key: z.string().max(200),
  system_prompt: z.string().max(100000),
  model: z.string(),
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

  return redirect('/')
}

export default function ConfigPage() {
  const { config } = useLoaderData<typeof clientLoader>()
  const lastResult = useActionData<typeof clientAction>()
  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      anthropic_api_key: config.anthropic_api_key,
      system_prompt: config.system_prompt,
      model: config.model,
    },
    constraint: getZodConstraint(schema),
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })
  const modelControl = useInputControl(fields.model)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      form.dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  return (
    <div className="flex h-screen flex-col">
      <Stack className="flex-1 gap-2  p-2" asChild>
        <Form method="POST" {...getFormProps(form)}>
          <h1 className="text-2xl font-bold">Configurations</h1>
          <div>{fields.model.valid}</div>
          <Stack className="flex-1">
            {/* anthropic  */}
            <div>
              <Label htmlFor={fields.anthropic_api_key.id}>
                Anthropic API Key
              </Label>
              <Input
                {...getInputProps(fields.anthropic_api_key, {
                  type: 'password',
                })}
              />
              <div
                className="text-destructive"
                id={fields.anthropic_api_key.errorId}
              >
                {fields.anthropic_api_key.errors}
              </div>
            </div>

            {/* system prompt */}
            <div className="flex flex-1 flex-col gap-1">
              <Label className="block" htmlFor={fields.system_prompt.id}>
                System Prompt
              </Label>
              <Textarea
                className="flex-1"
                {...getTextareaProps(fields.system_prompt)}
              />

              <div
                className="text-destructive"
                id={fields.system_prompt.errorId}
              >
                {fields.system_prompt.errors}
              </div>
            </div>
          </Stack>

          {/* model */}
          <Label htmlFor={fields.model.id}>Model</Label>
          <Select
            defaultValue={fields.model.initialValue}
            onValueChange={modelControl.change}
            onOpenChange={(open) => {
              if (!open) modelControl.blur()
            }}
          >
            <SelectTrigger
              id={fields.model.id}
              name={fields.model.name}
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
          <div id={fields.model.errorId} className="text-destructive">
            {fields.model.errors}
          </div>

          <HStack>
            <Button className="w-full" variant="ghost" asChild>
              <Link to={$path('/')}>Cancel</Link>
            </Button>
            <Button className="w-full" disabled={!form.dirty}>
              Save
            </Button>
          </HStack>
        </Form>
      </Stack>

      {blocker.state === 'blocked' && (
        <HStack className="bg-primary px-4 py-2 text-primary-foreground">
          <div className="flex-1">
            Are you sure you want to leave without saving?
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => blocker.proceed()}
          >
            Continue
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => blocker.reset()}
          >
            Stay
          </Button>
        </HStack>
      )}
    </div>
  )
}
