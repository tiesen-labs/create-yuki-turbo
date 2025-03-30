import { Outlet } from 'react-router'

import { Card } from '@yuki/ui/card'

export default function AuthLayout() {
  return (
    <main className="container grid min-h-dvh place-items-center">
      <Card className="w-screen max-w-md">
        <Outlet />
      </Card>
    </main>
  )
}
