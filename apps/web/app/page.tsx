import type { NextPage } from 'next'
import Image from 'next/image'

import { icons } from '@yuki/ui'
import { Button } from '@yuki/ui/button'
import { Typography } from '@yuki/ui/typography'

const Page: NextPage = () => (
  <main className="grid min-h-dvh place-items-center">
    <div className="container flex max-w-screen-lg flex-col items-center">
      <Image src="/tiesen.png" width={2500} height={400} alt="tiesen" />

      <Typography level="h1" className="text-center brightness-150">
        Clean and typesafe starter repo using{' '}
        <span className="bg-gradient-to-br from-info to-success bg-clip-text text-transparent">
          Turborepo
        </span>{' '}
        along with{' '}
        <span className="bg-gradient-to-br from-success to-warning bg-clip-text text-transparent">
          Next.js
        </span>
      </Typography>

      <Button variant="outline" className="mt-6 gap-2" asChild>
        <a
          href="https://github.com/tiesen243/create-yuki-turbo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <icons.Github /> Github
        </a>
      </Button>
    </div>
  </main>
)

export default Page
