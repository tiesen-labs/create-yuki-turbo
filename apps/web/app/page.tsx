import { Suspense } from 'react'

import { Typography } from '@yuki/ui/typography'

import { api, HydrateClient } from '@/lib/trpc/server'
import { AuthShowcase } from './_components/auth-showcase'
import { CreatePostForm, PostCardSkeleton, PostList } from './_components/post'

export const runtime = 'edge'

export default () => {
  void api.post.all.prefetch()

  return (
    <HydrateClient>
      <main className="container flex min-h-dvh max-w-screen-lg flex-col items-center justify-center overflow-x-hidden">
        <div className="pointer-events-none relative -z-10 flex place-items-center before:absolute before:h-[700px] before:w-[140px] before:translate-x-1 before:translate-y-[-10px] before:rotate-[-32deg] before:rounded-full before:bg-gradient-to-r before:from-[#2C2F7B] before:to-[#B45076] before:opacity-50 before:blur-[100px] before:content-[''] lg:before:h-[700px] lg:before:w-[240px] lg:before:translate-x-[-100px]" />
        <Typography level="h1" className="mb-4 text-center">
          Create <span className="text-[#774087]">Yuki</span> Turbo
        </Typography>

        <AuthShowcase />

        <CreatePostForm />

        <div className="mt-4 w-full max-w-2xl overflow-y-scroll">
          <Suspense
            fallback={
              <div className="flex w-full flex-col gap-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            }
          >
            <PostList />
          </Suspense>
        </div>
      </main>
    </HydrateClient>
  )
}
