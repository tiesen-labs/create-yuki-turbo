import * as z from 'zod'

export const byIdSchema = z.object({
  id: z.uuid(),
})

export const createPostSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
})
