import { Link } from 'react-router'

import { auth } from '@yuki/auth'
import { Button } from '@yuki/ui/button'
import { Typography } from '@yuki/ui/typography'

import type { Route } from './+types/_index'
import { CreatePost, PostList } from '@/components/post'

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await auth(request)

  return { session }
}
export default function HomePage({
  loaderData: { session },
}: Route.ComponentProps) {
  return (
    <main className="container max-w-2xl py-4">
      <Typography variant="h1" className="text-center">
        Create
        <span className="text-[#78a9ff]"> Yuki </span>
        Turbo
      </Typography>

      <Typography size="lg" className="text-center">
        A type-safe fullstack framework for building web applications.
      </Typography>

      <section className="mt-4 flex flex-col gap-4">
        <h2 className="sr-only">Authenticating Section</h2>

        {!session.user && (
          <Button asChild>
            <Link to="/login">Login</Link>
          </Button>
        )}

        {session.user && (
          <div className="flex justify-between">
            <Typography variant="h3">Welcome, {session.user.name}</Typography>
            <form action="/api/auth/sign-out" method="POST">
              <Button variant="secondary">Logout</Button>
            </form>
          </div>
        )}
      </section>

      <section className="mt-4 flex flex-col gap-4">
        <h2 className="sr-only">Posts List Section</h2>

        <CreatePost />

        <PostList />
      </section>
    </main>
  )
}
