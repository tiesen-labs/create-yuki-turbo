import { z } from 'zod'

export const getByIdSchema = z.object({ id: z.string() })
export type GetByIdInput = z.infer<typeof getByIdSchema>

export const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})
export type CreateInput = z.infer<typeof createSchema>
