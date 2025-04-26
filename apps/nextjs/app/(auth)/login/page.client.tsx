'use client'

import { useRouter } from 'next/navigation'
import { useQueryStates } from 'nuqs'

import { useSession } from '@yuki/auth/react'
import { Button } from '@yuki/ui/button'
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

import { useORPC } from '@/lib/orpc/react'
import { redirect } from '../_search-params'

export const LoginForm: React.FC = () => {
  const [{ redirectTo }] = useQueryStates(redirect.parsers, redirect.configs)

  const { orpcClient } = useORPC()
  const { refresh } = useSession()
  const router = useRouter()

  const form = useForm({
    schema: signInSchema,
    defaultValues: { email: '', password: '' },
    submitFn: orpcClient.auth.signIn,
    onSuccess: async (token) => {
      await refresh(token)
      router.push(
        redirectTo
          ? redirectTo.startsWith('http://') ||
            redirectTo.startsWith('https://') ||
            redirectTo.startsWith('exp:')
            ? `${redirectTo}?token=${token}`
            : redirectTo
          : '/',
      )
      toast.success('You have successfully logged in!')
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
