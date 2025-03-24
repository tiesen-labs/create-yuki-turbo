import { useQuery } from '@tanstack/react-query'

import type { Route } from './+types/_index'
import { useSession } from '@/lib/auth'
import { useTRPC } from '@/lib/trpc/react'

export default function HomePage(_: Route.ComponentProps) {
  const trpc = useTRPC()
  const { session } = useSession()
  const { data, isLoading } = useQuery(trpc.post.all.queryOptions())

  return (
    <main>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {isLoading ? 'Loading...' : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  )
}
