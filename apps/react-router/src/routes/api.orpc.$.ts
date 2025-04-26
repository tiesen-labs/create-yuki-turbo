import { handlers } from '@yuki/api'

import type { Route } from './+types/api.orpc.$'

export const loader = async ({ request }: Route.LoaderArgs) => {
  setAuthorization(request)
  return handlers(request)
}
export const action = async ({ request }: Route.ActionArgs) => {
  setAuthorization(request)
  return handlers(request)
}

const setAuthorization = (req: Request) => {
  const cookieHeader = req.headers.get('cookie')
  const token = cookieHeader
    ?.split('; ')
    .find((c) => c.startsWith('auth_token'))
    ?.replace('auth_token=', '')

  req.headers.set('authorization', `Bearer ${token}`)
}
