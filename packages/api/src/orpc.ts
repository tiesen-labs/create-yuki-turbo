/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the oRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */

import type { ResponseHeadersPluginContext } from '@orpc/server/plugins'
import { ORPCError, os } from '@orpc/server'

import type { SessionResult } from '@yuki/auth'
import { auth, Session } from '@yuki/auth'
import { db } from '@yuki/db'

/**
 * Isomorphic Session getter for API requests
 * - Expo requests will have a session token in the Authorization header
 * - Next.js requests will have a session token in cookies
 */
const isomorphicGetSession = async (
  headers: Headers,
): Promise<SessionResult> => {
  const authToken = headers.get('Authorization') ?? ''

  if (authToken)
    return new Session().validateToken(authToken.replace('Bearer ', ''))
  return auth()
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a oRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://orpc.unnoq.com/docs/context
 */
export const createORPCContext = async (opts: { headers: Headers }) => {
  const session = await isomorphicGetSession(opts.headers)

  const source = opts.headers.get('x-orpc-source') ?? 'unknown'
  console.log(
    '>>> oRPC Request from',
    source,
    'by',
    session.user ?? 'anonymous',
  )

  return {
    db,
    session,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the orpc api is initialized, connecting the context and
 * transformer
 */
const o = os.$context<
  ResponseHeadersPluginContext & Awaited<ReturnType<typeof createORPCContext>>
>()

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your oRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your oRPC API
 * @see https://orpc.unnoq.com/docs/router
 */
export const createORPCRouter = o.router.bind(o)

/**
 * Middleware for timing procedure execution.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = o.middleware(async ({ next, path }) => {
  const start = Date.now()

  const result = await next()

  const end = Date.now()
  console.log(`[ORPC] ${path.join('/')} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * oRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = o.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://orpc.unnoq.com/docs/procedure
 */
export const protectedProcedure = o
  .use(timingMiddleware)
  .use(({ context, next }) => {
    if (!context.session.user) throw new ORPCError('UNAUTHORIZED')

    return next({
      context: {
        // infers the `session` as non-nullable
        session: { ...context.session, user: context.session.user },
      },
    })
  })
