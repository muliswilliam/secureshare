import React from 'react'

export function HomeContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:flex-row">
        <div className="flex justify-end order-2 w-full md:order-1">
          <div className="flex flex-col justify-start p-4 md:p-8 lg:p-12 lg:border-r 2xl:max-w-[754px]">
            <h1 className="text-left text-xl lg:text-2xl xl:text-3xl py-4 md:py-8 font-bold">What we do</h1>
            <p className="text-md mb-6 font-light">
              Send secrets instantly and securely.
            </p>
            <ul className="list-none list-outside ml-7">
              <li className="pl-4 info-list-item relative">
                <p className="text-lg leading-10 font-semibold">
                  Secure Communication
                </p>
                <p className="text-md leading-8 font-light">
                  Our single-access messaging ensures private and confidential
                  conversations. Track opened messages to see who accessed your
                  chats.
                </p>
              </li>
              <li className="mt-6 pl-4 info-list-item relative">
                <p className="text-lg leading-8 font-semibold">
                  Encrypted Browser Security
                </p>
                <p className="text-md leading-8 font-light">
                  We use advanced browser encryption to keep your messages safe,
                  making it impossible for hackers and even our team to access
                  them.
                </p>
              </li>
              <li className="mt-6 pl-4 info-list-item relative">
                <p className="text-lg leading-8 font-semibold">
                  Protection from Breaches
                </p>
                <p className="text-md leading-8 font-light">
                  Your information is untouchable from data breaches and leaks
                  as the shared secrets expires after use.
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