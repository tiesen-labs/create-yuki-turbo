import { signIn } from '@yuki/auth'
import { Button } from '@yuki/ui/button'
import { Card, CardFooter } from '@yuki/ui/card'
import { DiscordIcon, GoogleIcon } from '@yuki/ui/icons'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="container grid min-h-dvh place-items-center">
      <Card className="w-screen max-w-md">
        {children}

        <CardFooter className="grid gap-2">
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="text-muted-foreground relative z-10 px-2">
              Or continue with
            </span>
          </div>

          <form className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              formAction={async () => {
                'use server'
                await signIn('discord')
              }}
            >
              <DiscordIcon />
              <span className="sr-only md:not-sr-only">Discord</span>
            </Button>
            <Button
              variant="outline"
              formAction={async () => {
                'use server'
                await signIn('google')
              }}
            >
              <GoogleIcon />
              <span className="sr-only md:not-sr-only">Google</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </main>
  )
}
