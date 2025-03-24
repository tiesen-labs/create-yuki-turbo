import { handlers } from '@yuki/api'

import type { Route } from './+types/api.trpc.$trpc'

export const loader = async ({ request }: Route.LoaderArgs) => {
  return handlers(request)
}

export const action = async ({ request }: Route.ActionArgs) => {
  return handlers(request)
}
