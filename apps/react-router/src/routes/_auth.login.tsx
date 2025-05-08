import type { z } from 'zod'
import { data, Link, useNavigate } from 'react-router'

import { signIn } from '@yuki/auth'
import { useSession } from '@yuki/auth/react'
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
import { toast } from '@yuki/ui/sonner'
import { signInSchema } from '@yuki/validators/auth'

import type { Route } from './+types/_auth.login'

export const action = async ({ request }: Route.ActionArgs) => {
  const input = (await request.json()) as z.infer<typeof signInSchema>
  const { sessionCookie, token } = await signIn({
    ...input,
    skipSetCookie: true,
  })
  return data({ token }, { headers: { 'Set-Cookie': sessionCookie } })
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

        <p className="mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="hover:underline">
            Register{' '}
          </Link>{' '}
        </p>
      </CardContent>
    </>
  )
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { refresh } = useSession()
  const form = useForm({
    schema: signInSchema,
    defaultValues: { email: '', password: '' },
    submitFn: async (values) => {
      const res = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(values),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Invalid email or password')
      return (await res.json()) as { token: string }
    },
    onSuccess: async ({ token }) => {
      await refresh(token)
      toast.success('You have successfully logged in!')
      await navigate('/')
    },
    onError: (error) => {
      toast.error(error)
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

      <Button disabled={form.isPending}>Login</Button>
    </Form>
  )
}
