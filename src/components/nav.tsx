import React from 'react'
import { useAuth, useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

// utils
import { cn } from '@/lib/utils'

// components
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

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

  // hooks
  const { userId } = useAuth()
  const { signOut } = useClerk()

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
                  <Button variant="ghost" className="whitespace-nowrap">
                    <Link href="/sign-in">Login</Link>
                  </Button>
                  <Button className="mr-6 whitespace-nowrap">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => signOut({})}
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
    </>
  )
}
