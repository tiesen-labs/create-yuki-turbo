import { Button } from '@yuki/ui/button'
import { Input } from '@yuki/ui/input'

import { api } from '@/lib/trpc'

export const Post: React.FC = () => {
  const { data: latestPost, isLoading, refetch } = api.post.getLatestPost.useQuery()
  const createPost = api.post.createPost.useMutation({ onSuccess: () => refetch() })

  return (
    <div className="mt-4 w-full max-w-screen-sm">
      <span className="text-lg">
        Latest post: {isLoading ? 'Loading...' : (latestPost?.content ?? 'No posts')}
      </span>
      <form
        className="flex w-full gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          createPost.mutate({ content: String(new FormData(e.currentTarget).get('content')) })
          e.currentTarget.reset()
        }}
      >
        <Input name="content" placeholder="Post's content" disabled={createPost.isPending} />
        <Button disabled={createPost.isPending}> Post </Button>
      </form>
    </div>
  )
}
