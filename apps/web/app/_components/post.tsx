'use client'

import type { RouterOutputs } from '@yuki/api'
import { Button } from '@yuki/ui/button'
import { Card, CardHeader, CardTitle } from '@yuki/ui/card'
import { toast } from '@yuki/ui/hooks/use-toast'
import { Input } from '@yuki/ui/input'
import { cn } from '@yuki/ui/lib/utils'

import { api } from '@/lib/trpc/react'

export const CreatePostForm: React.FC = () => {
  const utils = api.useUtils()
  const createPost = api.post.create.useMutation({
    onSuccess: async () => utils.post.invalidate(),
    onError: (err) => {
      toast({
        title: 'Failed to create post',
        description:
          err.data?.code === 'UNAUTHORIZED'
            ? 'You must be logged in to post'
            : 'Failed to create post',
        variant: 'error',
      })
    },
  })

  return (
    <form
      className="flex w-full max-w-2xl flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        createPost.mutate({ title: fd.get('title') as string })
        e.currentTarget.reset()
      }}
    >
      <Input name="title" placeholder="What's on your mind?" />
      <Button disabled={createPost.isPending}>Create</Button>
    </form>
  )
}

export const PostList: React.FC = () => {
  const [posts] = api.post.all.useSuspenseQuery()

  return (
    <div className="flex w-full flex-col gap-4 md:max-h-80 md:overflow-y-auto">
      {posts.map((p) => {
        return <PostCard key={p.id} post={p} />
      })}
    </div>
  )
}

export const PostCard: React.FC<{ post: RouterOutputs['post']['all'][number] }> = ({
  post,
}) => {
  const utils = api.useUtils()
  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => utils.post.invalidate(),
    onError: (err) => {
      toast({
        title: 'Failed to delete post',
        description:
          err.data?.code === 'UNAUTHORIZED'
            ? 'You must be logged in to delete a post'
            : 'Failed to delete post',
        variant: 'error',
      })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <Button
        variant="ghost"
        className="absolute right-4 top-4"
        onClick={() => deletePost.mutate(post)}
      >
        Delete
      </Button>
    </Card>
  )
}

export const PostCardSkeleton: React.FC<{ pulse?: boolean }> = ({
  pulse = true,
}) => (
  <div className="flex flex-row rounded-lg bg-muted p-4">
    <div className="flex-grow">
      <h2
        className={cn(
          'w-1/4 rounded bg-primary text-2xl font-bold',
          pulse && 'animate-pulse',
        )}
      >
        &nbsp;
      </h2>
      <p
        className={cn(
          'mt-2 w-1/3 rounded bg-current text-sm',
          pulse && 'animate-pulse',
        )}
      >
        &nbsp;
      </p>
    </div>
  </div>
)
