import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  Form,
  Link,
  useActionData,
  type ClientActionFunctionArgs,
} from '@remix-run/react'
import { z } from 'zod'
import { greet } from '~/commands'
import { Button, Input, Label, Stack } from '~/components/ui'

const schema = z.object({
  name: z.string(),
})

export const clientAction = async ({ request }: ClientActionFunctionArgs) => {
  const submission = parseWithZod(await request.formData(), { schema })
  if (submission.status !== 'success') {
    return
  }
  const greetMessage = await greet(submission.value.name)
  return { greetMessage }
}

export default function IndexPage() {
  const [form, { name }] = useForm({
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
  })
  const actionData = useActionData<typeof clientAction>()

  return (
    <div>
      <h1 className="text-4xl font-bold">Hello Remix SPA mode on Tauri!</h1>
      <img src="/tauri.svg" alt="tauri" />
      <Link to="/test" className="text-blue-500 underline">
        Test Page
      </Link>

      <Stack asChild>
        <Form method="POST" {...getFormProps(form)}>
          <div>
            <Label htmlFor={name.id}>Name</Label>
            <Input
              placeholder="Enter a name..."
              {...getInputProps(name, { type: 'text' })}
            />
            <div id={name.errorId} className="text-destructive">
              {name.errors}
            </div>
          </div>

          <Button type="submit">Greet</Button>

          <p>{actionData?.greetMessage}</p>
        </Form>
      </Stack>
    </div>
  )
}
