import React from 'react'
import { UserButton, useAuth, useClerk } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

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
  const { theme } = useTheme()

  // hooks
  const { userId } = useAuth()

  return (
    <>
      <div className="flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center justify-between px-4 px:md-4">
            <Link href="/">
              <img
                src="/logo.png"
                alt="Secure share logo"
                width={40}
                height='auto'
              />
            </Link>
            <div className="flex">
              <nav
                className={cn(
                  'hidden md:flex items-center space-x-4 lg:space-x-6',
                  className
                )}
                {...props}
              ></nav>
              {!userId ? (
                <div className="flex gap-4">
                  <Button variant="ghost" className="whitespace-nowrap">
                    <Link href="/sign-in">Login</Link>
                  </Button>

                  <Button className="mr-6 whitespace-nowrap">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <div className="mx-4">
                  <UserButton afterSignOutUrl="/" />
                </div>
              )}
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
