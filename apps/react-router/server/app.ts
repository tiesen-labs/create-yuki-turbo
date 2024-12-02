import { createRequestHandler } from '@react-router/express'
import express from 'express'

import 'react-router'

declare module 'react-router' {
  export interface AppLoadContext {
    DISCORD_CLIENT_ID: string
    DISCORD_CLIENT_SECRET: string
  }
}

const app = express()

app.use(
  createRequestHandler({
    // @ts-expect-error - virtual module provided by React Router at build time
    build: () => import('virtual:react-router/server-build'),
    getLoadContext() {
      return {
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
      }
    },
  }),
)

export default app
