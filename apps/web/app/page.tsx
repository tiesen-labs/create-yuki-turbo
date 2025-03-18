import { Suspense } from 'react'

import { Typography } from '@yuki/ui/typography'

import { getQueryClient, HydrateClient, trpc } from '@/lib/trpc/server'
import { CreatePost, PostCardSkeleton, PostList } from './page.client'

export default function HomePage() {
  void getQueryClient().prefetchQuery(trpc.post.all.queryOptions())

  return (
    <HydrateClient>
      <main className="container py-4">
        <Typography variant="h1" className="text-center">
          Create
          <span className="text-[#78a9ff]"> Yuki </span>
          Turbo
        </Typography>

        <Typography size="lg" className="text-center">
          A type-safe fullstack framework for building web applications.
        </Typography>

        <section className="mx-auto mt-4 flex max-w-xl flex-col gap-4">
          <h2 className="sr-only">Posts List Section</h2>

          <CreatePost />

          <Suspense
            fallback={Array.from({ length: 5 }, (_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          >
            <PostList />
          </Suspense>
        </section>
      </main>
    </HydrateClient>
  )
}
