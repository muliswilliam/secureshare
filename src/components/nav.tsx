import React from 'react'
import { useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

// utils
import { cn } from '@/lib/utils'

// components
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { AuthDialog } from './auth-dialog'

function MenuItem({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
    >
      {label}
    </Link>
  )
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState<boolean>(false)
  const [isSignup, setIsSignup] = React.useState<boolean>(false)

  // hooks
  const { userId, signOut } = useAuth()

  return (
    <>
      <div className="flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center justify-between px-1 px:md-4">
            <Image
              src="vercel.svg"
              alt="Secure share logo"
              width={60}
              height={60}
            />
            <div className="flex">
              <nav
                className={cn(
                  'hidden md:flex items-center space-x-4 lg:space-x-6',
                  className
                )}
                {...props}
              >
                <MenuItem label="Encrypted Chat" href="/encrypted-chat" />
              </nav>
              {!userId ? (
                <>
                  <Button
                    onClick={() => {
                      setIsSignup(false)
                      setIsAuthDialogOpen(true)
                    }}
                    variant="ghost"
                    className="whitespace-nowrap"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      setIsSignup(true)
                      setIsAuthDialogOpen(true)
                    }}
                    className="mr-6 whitespace-nowrap"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button
                onClick={() => signOut}
                className="mr-6 whitespace-nowrap"
              >
                Sign Out
              </Button>

              )}
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
      <AuthDialog
        open={isAuthDialogOpen}
        isSignUp={isSignup}
        toggleSignUp={() => setIsSignup((prev) => !prev)}
        onClose={() => setIsAuthDialogOpen((prev) => !prev)}
      />
    </>
  )
}
