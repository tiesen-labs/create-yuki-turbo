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
      </CardContent>

      <OauthButtons redirect_uri={redirect_uri} />
    </>
  )
}
