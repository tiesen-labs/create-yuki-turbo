import type {
  InferRouterInputs,
  InferRouterOutputs,
  RouterClient,
} from '@orpc/server'
import { createRouterClient } from '@orpc/server'
import { RPCHandler } from '@orpc/server/fetch'
import {
  BatchHandlerPlugin,
  CORSPlugin,
  ResponseHeadersPlugin,
} from '@orpc/server/plugins'

import { createORPCContext, createORPCRouter } from './orpc'
import { authRouter } from './routers/auth'
import { postRouter } from './routers/post'

const appRouter = createORPCRouter({
  auth: authRouter,
  post: postRouter,
})

/**
 * Export type definition of API
 */
type AppRouter = RouterClient<typeof appRouter>

/**
 * Handle incoming API requests
 */
const handlers = async (req: Request) => {
  let response: Response

  if (req.method === 'OPTIONS') {
    response = new Response(null, { status: 204 })
  } else {
    const handler = new RPCHandler(appRouter, {
      plugins: [
        new BatchHandlerPlugin(),
        new CORSPlugin(),
        new ResponseHeadersPlugin(),
      ],
    })

    const result = await handler.handle(req, {
      prefix: '/api/orpc',
      context: await createORPCContext({ headers: req.headers }),
    })

    if (result.response) response = result.response
    else response = new Response('Not Found', { status: 404 })
  }

  return response
}

/**
 * Create a server-side caller for the oRPC API
 * @example
 * const orpc = createCaller(createContext);
 * const res = await orpc.post.all();
 *       ^? Post[]
 */
const createCaller = (
  createContext: () => ReturnType<typeof createORPCContext>,
) => createRouterClient(appRouter, { context: createContext })

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = InferRouterInputs<typeof appRouter>

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = InferRouterOutputs<typeof appRouter>

export type { AppRouter, RouterInputs, RouterOutputs }
export { appRouter, createCaller, createORPCContext, handlers }
