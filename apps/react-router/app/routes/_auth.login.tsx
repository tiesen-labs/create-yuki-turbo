import { data, redirect, useFetcher } from 'react-router'

import { signIn } from '@yuki/auth'
import { env } from '@yuki/env'
import { Button } from '@yuki/ui/button'
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@yuki/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@yuki/ui/form'
import { Input } from '@yuki/ui/input'
import { signInSchema } from '@yuki/validators/auth'

import type { Route } from './+types/_auth.login'

export const action = async ({ request }: Route.ActionArgs) => {
  try {
    const formData = await request.formData()

    const session = await signIn({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    return redirect('/', {
      headers: {
        'Set-Cookie': `auth_token=${session.sessionToken}; Path=/; HttpOnly; ${env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${session.expires}`,
      },
    })
  } catch (error) {
    if (error instanceof Error) return data({ error: error.message })
    return data({ error: 'An unknown error occurred' })
  }
}

export default function LoginPage(_: Route.ComponentProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials below to login to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </>
  )
}

const LoginForm: React.FC = () => {
  const { submit, state } = useFetcher<typeof action>()

  const form = useForm({
    schema: signInSchema,
    defaultValues: { email: '', password: '' },
    submitFn: async (values) => {
      await submit(values, { method: 'POST' })
    },
  })

  return (
    <Form form={form}>
      <FormField
        name="email"
        render={(field) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl {...field}>
              <Input type="email" placeholder="yuki@example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="password"
        render={(field) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl {...field}>
              <Input type="password" placeholder="••••••••" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button disabled={state === 'submitting'}>Login</Button>
    </Form>
  )
}
