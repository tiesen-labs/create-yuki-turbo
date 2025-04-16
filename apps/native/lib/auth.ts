import * as Linking from 'expo-linking'
import * as Browser from 'expo-web-browser'

import { setToken } from './session'

export const signIn = async () => {
  const signInUrl = `https://yuki-dev.vercel.app/login`
  const redirectTo = Linking.createURL('/')
  const result = await Browser.openAuthSessionAsync(
    `${signInUrl}?redirect_uri=${encodeURIComponent(redirectTo)}`,
    redirectTo,
  )

  if (result.type !== 'success') return ''
  const url = Linking.parse(result.url)
  const sessionToken = String(url.queryParams?.token)
  if (!sessionToken) throw new Error('No session token found')

  setToken(sessionToken)
  return sessionToken
}
