import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { Link } from '@remix-run/react'
import { invoke } from '@tauri-apps/api/tauri'
import { useState } from 'react'
import { z } from 'zod'
import { Button, Input, Label, Stack } from '~/components/ui'

const schema = z.object({
  name: z.string(),
})

const greet = async (name: string): Promise<string> => {
  return await invoke('greet', { name })
}

const executeCommand = async () => {
  return await invoke('simple_command')
}

export default function IndexPage() {
  const [greetMsg, setGreetMsg] = useState('')
  const [form, { name }] = useForm({
    onValidate: ({ formData }) => parseWithZod(formData, { schema }),
    onSubmit: async (event, { formData }) => {
      event.preventDefault()
      const submission = parseWithZod(formData, { schema })
      if (submission.status !== 'success') {
        return
      }
      const greetMessage = await greet(submission.value.name)
      setGreetMsg(greetMessage)
    },
  })

  return (
    <div>
      <h1 className="text-4xl font-bold">Hello Remix SPA mode on Tauri!</h1>
      <img src="/tauri.svg" alt="tauri" />
      <Link to="/test" className="text-blue-500 underline">
        Test Page
      </Link>

      <Stack asChild>
        <form {...getFormProps(form)}>
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

          <p>{greetMsg}</p>
        </form>
      </Stack>
    </div>
  )
}
