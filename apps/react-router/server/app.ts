import { createRequestHandler } from '@react-router/express'
import express from 'express'

import 'react-router'

declare module 'react-router' {
  export interface AppLoadContext {
    cookies: Record<string, string>
  }
}

const app = express()

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import('virtual:react-router/server-build'),
    getLoadContext({ headers }) {
      const cookies = headers.cookie
        ? headers.cookie.split(';').reduce(
            (acc, cookie) => {
              const [key, value] = cookie.split('=') as [string, string]
              acc[key.trim()] = value.trim()
              return acc
            },
            {} as Record<string, string>,
          )
        : {}

      return {
        cookies,
      }
    },
  }),
)

export default app
