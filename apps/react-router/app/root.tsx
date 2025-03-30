import '@/app.css'

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import { SessionProvider } from '@yuki/auth/react'
import { env } from '@yuki/env'
import { Toaster } from '@yuki/ui/sonner'
import { ThemeProvider } from '@yuki/ui/utils'

import type { Route } from './+types/root'
import { createMetadata } from '@/lib/metadata'
import { TRPCReactProvider } from '@/lib/trpc/react'

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <SessionProvider>{children}</SessionProvider>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details
  } else if (
    env.NODE_ENV === 'development' &&
    error &&
    error instanceof Error
  ) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}

export const meta = createMetadata()

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap',
  },
  {
    rel: 'icon',
    type: 'image/x-icon',
    href: 'https://tiesen.id.vn/favicon.ico',
  },
  {
    rel: 'shortcut icon',
    type: 'image/png',
    href: 'https://tiesen.id.vn/favicon-16x16.png',
  },
  {
    rel: 'apple-touch-icon',
    type: 'image/png',
    href: 'https://tiesen.id.vn/apple-touch-icon.png',
  },
]
