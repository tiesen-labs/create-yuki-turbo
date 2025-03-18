import './config'

import { type } from 'arktype'

export const byIdSchema = type({
  id: 'string',
})

export const createPostSchema = type({
  title: 'string>=4',
  content: 'string>=10',
})
