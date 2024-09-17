'use client'

import { useState } from 'react'

import { Button } from '@yuki/ui/button'
import { Input } from '@yuki/ui/input'

import { api } from '~/lib/trpc/react'

export const Post: React.FC = () => {
  const [post] = api.post.getPost.useSuspenseQuery()

  const utils = api.useUtils()
  const [content, setContent] = useState('')
  const createPost = api.post.createPost.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate()
      setContent('')
    },
  })

  return (
    <div className="w-full max-w-xs space-y-4">
      {post ? (
        <p className="truncate">Most recent post: {post.content}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          createPost.mutate({ content })
        }}
        className="flex flex-col gap-2"
      >
        <Input
          value={content}
          placeholder="What's on your mind?"
          onChange={(e) => setContent(e.target.value)}
        />
        <Button disabled={createPost.isPending}>
          {createPost.isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
