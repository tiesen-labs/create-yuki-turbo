import type { NextPage } from 'next'
import Image from 'next/image'

import { icons } from '@yuki/ui'
import { Button } from '@yuki/ui/button'
import { Typography } from '@yuki/ui/typography'

const Page: NextPage = () => (
  <main className="container flex min-h-dvh max-w-screen-lg flex-col items-center justify-center overflow-x-hidden">
    <div className="pointer-events-none relative flex place-items-center before:absolute before:h-[700px] before:w-[140px] before:translate-x-1 before:translate-y-[-10px] before:rotate-[-32deg] before:rounded-full before:bg-gradient-to-r before:from-[#AB1D1C] before:to-[#E18317] before:opacity-30 before:blur-[100px] before:content-[''] lg:before:h-[700px] lg:before:w-[240px] lg:before:translate-x-[-100px]" />

    <Image src="https://tiesen.id.vn/assets/tiesen.png" width={2500} height={400} alt="tiesen" />

    <Typography level="h1" className="text-center brightness-150">
      Clean and typesafe starter repo using{' '}
      <span className="bg-[linear-gradient(135deg,#EF4444,69%,hsl(var(--background)))] bg-clip-text text-transparent">
        Turborepo
      </span>{' '}
      along with{' '}
      <span className="bg-[linear-gradient(135deg,#AB1D1C,69%,hsl(var(--background)))] bg-clip-text text-transparent">
        Next.js
      </span>{' '}
      and{' '}
      <span className="bg-[linear-gradient(135deg,#2596BE,69%,hsl(var(--background)))] bg-clip-text text-transparent">
        TRPC
      </span>
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
  </main>
)

export default Page
