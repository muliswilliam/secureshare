import React from 'react'

export function HomeContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:flex-row">
      <div className="flex justify-end order-2 w-full md:order-1">
        <div className="flex flex-col justify-start p-4 md:p-8 lg:p-12 lg:border-r 2xl:max-w-[754px]">
          <h1 className="text-left text-xl lg:text-2xl xl:text-3xl py-4 md:py-8 font-bold">
            What we do
          </h1>
          <p className="text-md mb-6 font-light">
            Share Secrets Quickly and Securely.
          </p>
          <ul className="list-none list-outside ml-7">
            <li className="pl-4 info-list-item relative">
              <p className="text-lg leading-10 font-semibold">
                Enhanced Privacy
              </p>
              <p className="text-md leading-8 font-light">
                Our messaging platform ensures private and confidential
                conversations through single-access messaging. Easily track
                message views to identify chat participants.
              </p>
            </li>
            <li className="mt-6 pl-4 info-list-item relative">
              <p className="text-lg leading-8 font-semibold">
                Robust Browser Encryption
              </p>
              <p className="text-md leading-8 font-light">
                Our advanced browser encryption techniques guarantee the
                security of your messages, thwarting hackers and unauthorized
                access by any party, including our team.
              </p>
            </li>
            <li className="mt-6 pl-4 info-list-item relative">
              <p className="text-lg leading-8 font-semibold">
                Ironclad Data Protection
              </p>
              <p className="text-md leading-8 font-light">
                Your information remains invulnerable to data breaches and
                leaks. Our shared secrets expire after each use, providing an
                added layer of security for your data.
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex order-1 md:order-1 w-full">
        <div className="flex flex-col w-[100%] justify-start p-4 md:p-8 lg:p-12 2xl:max-w-[754px]">
          {children}
        </div>
      </div>
    </div>
  )
}