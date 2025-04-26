import type { SearchParams } from 'nuqs'
import { Suspense } from 'react'
import Link from 'next/link'

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@yuki/ui/card'

import { OauthButtons } from '../_oauth-buttons'
import { redirectCaches } from '../_search-params'
import { LoginForm } from './page.client'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await redirectCaches.parse(searchParams)

  return (
    <>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials below to login to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense>
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </p>
      </CardContent>

      <OauthButtons />
    </>
  )
}
