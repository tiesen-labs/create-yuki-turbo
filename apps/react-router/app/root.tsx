import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import { ThemeProvider } from '@yuki/ui'
import stylesheet from '@yuki/ui/tailwind.css?url'

import type { Route } from './+types/root'
import { env } from '@/env'
import { icons, seo } from '@/lib/seo'
import { TRPCReactProvider } from '@/lib/trpc'
import { CookiesProvider } from './lib/hooks/use-cookies'

export const meta = seo({})

export const links: Route.LinksFunction = () => [
  ...icons,
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: stylesheet },
]

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body className="min-h-dvh font-sans antialiased">
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        {children}
      </ThemeProvider>

      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
)

export const loader = ({ context }: Route.LoaderArgs) => {
  return { cookies: context.cookies }
}

export default ({ loaderData }: Route.ComponentProps) => (
  <CookiesProvider allCookies={loaderData.cookies}>
    <TRPCReactProvider>
      <Outlet />
    </TRPCReactProvider>
  </CookiesProvider>
)

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'This page could not be found.' : error.statusText || details
  } else if (env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-5">
        <h1 className="text-2xl font-medium">{message}</h1>
        <div className="h-12 w-[1px] bg-muted" />
        <p className="text-sm">{details}</p>
      </div>

      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
