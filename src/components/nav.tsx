import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

function MenuItem({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className='text-sm font-medium transition-colors hover:text-primary'
    >
      {label}
    </Link>
  );
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className='flex-col md:flex'>
      <div className='border-b'>
        <div className='flex h-16 items-center justify-between px-1 px:md-4'>
          <Image
            src='vercel.svg'
            alt='Secure share logo'
            width={60}
            height={60}
          />
          <div className='flex'>
            <nav
              className={cn(
                'flex items-center space-x-4 lg:space-x-6',
                className
              )}
              {...props}
            >
              <MenuItem label='Encrypted Chat' href='/encrypted-chat' />
            </nav>
            <Button asChild variant='ghost'>
              <Link href='/login'>Login</Link>
            </Button>
            <Button asChild className='mr-6'>
              <Link href='/sign-up'>Sign Up</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
