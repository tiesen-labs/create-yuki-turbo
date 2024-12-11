import type { Route } from './+types/_index'

export const loader = ({ context }: Route.LoaderArgs) => {
  return { message: context.VALUE_FROM_VERCEL }
}

export default ({ loaderData }: Route.ComponentProps) => {
  return <div>{loaderData.message}</div>
}
