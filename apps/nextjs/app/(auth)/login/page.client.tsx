'use client'

import { useRouter } from 'next/navigation'

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

import { useTRPCClient } from '@/lib/trpc/react'
import { setSessionCookie } from './page.action'

export const LoginForm: React.FC<{ redirect_uri?: string }> = ({
  redirect_uri,
}) => {
  const router = useRouter()
  const trpcClient = useTRPCClient()

  const form = useForm({
    schema: signInSchema,
    defaultValues: { email: '', password: '' },
    submitFn: trpcClient.auth.signIn.mutate,
    onSuccess: async (session) => {
      toast.success('You have successfully logged in!')
      await setSessionCookie(session)
      router.push(redirect_uri ?? '/')
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
