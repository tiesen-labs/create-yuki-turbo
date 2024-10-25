'use client'

import { useState } from 'react'

import { Button } from '@yuki/ui/button'
import { Input } from '@yuki/ui/input'
import { Typography } from '@yuki/ui/typography'

import { api } from '@/lib/trpc/react'

export const Post: React.FC = () => {
  const [name, setName] = useState<string>('')

  const [post, { refetch }] = api.post.getLatest.useSuspenseQuery()
  const createPost = api.post.create.useMutation({ onSuccess: () => refetch() })

  return (
    <section className="flex flex-col items-center">
      <Typography>Your latest post: {post ? post.name : 'No posts yet'}</Typography>

      <form
        className="mt-4 flex gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name) return
          createPost.mutate({ name })
          setName('')
        }}
      >
        <Input
          placeholder="What's on your mind?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={createPost.isPending}
          className="w-80"
        />
        <Button disabled={createPost.isPending}>
          {createPost.isPending ? 'Posting...' : 'Post'}
        </Button>
      </form>
    </section>
  )
}
