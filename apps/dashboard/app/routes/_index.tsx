import { useQuery } from '@tanstack/react-query'

import type { Route } from './+types/_index'
import { useTRPC } from '@/lib/trpc/react'

export default function HomePage(_: Route.ComponentProps) {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.post.all.queryOptions())

  return (
    <main>
      {isLoading ? 'Loading...' : <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  )
}
