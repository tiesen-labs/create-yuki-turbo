import Link from 'next/link'

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@yuki/ui/card'

import { OauthButtons } from '../_oauth-buttons'
import { LoginForm } from './page.client'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_uri?: string }>
}) {
  const { redirect_uri } = await searchParams

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials below to login to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm redirect_uri={redirect_uri} />

        <p className="mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </p>
      </CardContent>

      <OauthButtons redirect_uri={redirect_uri} />
    </>
  )
}
