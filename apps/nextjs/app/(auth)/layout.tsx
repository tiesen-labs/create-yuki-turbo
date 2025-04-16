import { Card } from '@yuki/ui/card'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="container grid min-h-dvh place-items-center">
      <Card className="w-screen max-w-md">{children}</Card>
    </main>
  )
}
