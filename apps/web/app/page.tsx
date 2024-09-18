import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { auth } from '@yuki/auth'
import { icons } from '@yuki/ui'
import { Button } from '@yuki/ui/button'
import { Typography } from '@yuki/ui/typography'

import { Post } from '@/app/_components/post'
import { signOut } from '@/lib/actions'
import { api, HydrateClient } from '@/lib/trpc/server'

const Page: NextPage = async () => {
  void api.post.getPost.prefetch()
  const session = await auth()

  return (
    <HydrateClient>
      <main className="grid min-h-dvh place-items-center">
        <div className="container flex max-w-screen-lg flex-col items-center">
          <Image
            src="https://tiesen.id.vn/images/tiesen.png"
            width={2500}
            height={400}
            alt="tiesen"
          />

          <Typography level="h1" className="text-center brightness-150">
            Clean and typesafe starter repo using{' '}
            <span className="bg-[linear-gradient(135deg,#EF4444,69%,hsl(var(--background)))] bg-clip-text text-transparent">
              Turborepo
            </span>{' '}
            along with{' '}
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              Next.js
            </span>
            .
          </Typography>

          <Button variant="outline" className="my-4 gap-2" asChild>
            <a
              href="https://github.com/tiesen243/create-yuki-turbo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <icons.Github /> Github
            </a>
          </Button>

          <div className="flex items-center gap-2">
            {session && <span>Logged in as {session.user.name}</span>}
            {session ? (
              <form
                action={async () => {
                  'use server'
                  await signOut(session.id)
                }}
              >
                <Button variant="ghost" size="sm">
                  Sign Out
                </Button>
              </form>
            ) : (
              <Button asChild>
                <Link href="/api/auth/discord">Sign in with Discord</Link>
              </Button>
            )}
          </div>

          {session && <Post />}
        </div>
      </main>
    </HydrateClient>
  )
}

export default Page
