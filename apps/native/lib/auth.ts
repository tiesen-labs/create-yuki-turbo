import * as Linking from 'expo-linking'
import * as Browser from 'expo-web-browser'

import { deleteToken, getToken, setToken } from '@/lib/session'

const BASE_URL = 'https://yuki-dev.vercel.app'

export const signIn = async () => {
  const redirectTo = Linking.createURL('/')
  const result = await Browser.openAuthSessionAsync(
    `${BASE_URL}/login?redirect_uri=${encodeURIComponent(redirectTo)}`,
    redirectTo,
  )

  if (result.type !== 'success') return ''
  const url = Linking.parse(result.url)
  const sessionToken = String(url.queryParams?.token)
  if (!sessionToken) throw new Error('No session token found')

  setToken(sessionToken)
  return sessionToken
}

export const signOut = async () => {
  await deleteToken()
  await fetch(`${BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  })
}
