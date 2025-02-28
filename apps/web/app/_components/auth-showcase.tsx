import { revalidatePath } from 'next/cache'

import { auth, signIn, signOut } from '@yuki/auth'
import { Button } from '@yuki/ui/button'
import { Typography } from '@yuki/ui/typography'

export async function AuthShowcase() {
  const session = await auth()

  if (!session.user) {
    return (
      <form className="mb-4 flex flex-col gap-4">
        <Button
          size="lg"
          formAction={async () => {
            'use server'
            await signIn('google')
          }}
        >
          Sign in with Google
        </Button>
      </form>
    )
  }

  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-4">
      <Typography className="text-xl">
        Logged in as {session.user.name}
      </Typography>

      <form
        action={async () => {
          'use server'
          await signOut()
          revalidatePath('/')
        }}
        method="POST"
      >
        <Button>Sign out</Button>
      </form>
    </div>
  )
}
