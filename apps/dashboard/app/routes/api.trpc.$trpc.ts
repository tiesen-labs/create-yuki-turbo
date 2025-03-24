import { handlers } from '@yuki/api'

import type { Route } from './+types/api.trpc.$trpc'

export const loader = async ({ request }: Route.LoaderArgs) => {
  setAuthToken(request)
  return handlers(request)
}

export const action = async ({ request }: Route.ActionArgs) => {
  setAuthToken(request)
  return handlers(request)
}

const setAuthToken = (request: Request) => {
  const cookieHeader = request.headers.get('cookie')
  const authToken =
    cookieHeader
      ?.split(';')
      .find((c) => c.trim().startsWith('auth_token='))
      ?.trim()
      .replace('auth_token=', '') ?? ''

  request.headers.set('Authorization', `Bearer ${authToken}`)
}
