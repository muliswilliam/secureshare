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
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/router'

const MenuItem = ({ label, href }: { label: string; href: string }) => {
  return (
    <Link
      href={href}
      className="text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
    >
      {label}
    </Link>
  )
}

interface DashboardOption {
  url: string
  label: string
  active?: boolean
}

const DashboardMenuItem = ({
  url,
  label,
  active
}: DashboardOption) => {
  return (
    <Link
      className={twMerge(
        ' p-1',
        active ? 'border-b-2 border-primary text-primary' : 'text-pdefault'
      )}
      href={url}
    >
      <div className="rounded-md px-3 py-2 transition-all duration-75 hover:bg-secondar">
        <p className="text-sm">{label}</p>
      </div>
    </Link>
  )
}

interface Props {
  className?: string
  showDashboardMenu?: boolean
}

export function MainNav({
  className,
  showDashboardMenu
}: Props) {
  // hooks
  const { userId } = useAuth()
  const router = useRouter()

  const dashboardMenuItems: DashboardOption[] = [
    {
      url: '/dashboard/messages',
      label: 'Messages'
    },
    {
      url: '/dashboard/settings',
      label: 'Settings'
    }
  ]

  return (
    <div className="flex-col md:flex sticky">
      <div className="border-b left-0 right-0">
        <div className="flex flex-col gap-4 px:md-4 mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
          <div className="flex flex-row items-center justify-between py-3">
            <Link href="/">
              <img
                src="/logo.png"
                alt="Secure share logo"
                width={40}
                height="auto"
              />
            </Link>
            <div className="flex items-center justify-between gap-6">
              <nav className={cn('hidden md:flex items-center', className)}>
                {userId && (
                  <MenuItem href="/dashboard/messages" label="Dashboard" />
                )}
              </nav>
              {!userId ? (
                <div className="flex items-center justify-between gap-6">
                  <Button
                    variant="outline"
                    className="hover:bg-primary whitespace-nowrap"
                  >
                    <Link href="/sign-in">Login</Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="hover:bg-primary whitespace-nowrap"
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <UserButton afterSignOutUrl="/" />
              )}
              <ModeToggle />
            </div>
          </div>
          {showDashboardMenu && (
            <div className="-mb-0.5 flex h-12 items-center justify-start space-x-2 overflow-x-auto scrollbar-hide">
              {dashboardMenuItems.map((item) => (
                <DashboardMenuItem
                  key={item.url}
                  {...item}
                  active={router.pathname === item.url}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
