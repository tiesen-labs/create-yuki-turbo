import type { SearchParams } from 'nuqs'
import Link from 'next/link'

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@yuki/ui/card'

import { OauthButtons } from '../_oauth-buttons'
import { redirectCaches } from '../_search-params'
import { RegisterForm } from './page.client'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await redirectCaches.parse(searchParams)

  return (
    <>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Enter your credentials below to register for an account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <RegisterForm />

        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </p>
      </CardContent>

      <OauthButtons />
    </>
  )
}
