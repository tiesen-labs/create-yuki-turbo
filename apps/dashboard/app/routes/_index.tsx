import type { Route } from './+types/_index'
import { PostList } from '@/components/post'

export default function HomePage(_: Route.ComponentProps) {
  return (
    <main className="container">
      <PostList />
    </main>
  )
}
