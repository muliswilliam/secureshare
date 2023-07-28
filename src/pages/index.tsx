import Head from 'next/head'
import MainLayout from '../layouts/main';

export default function Home() {
  return (
    <MainLayout>
      <Head>
        <title>Secure Share</title>
        <meta name='description' content='Share passwords securely.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col w-full h-[calc(100vh - 4rem)] lg:flex-row'>
        <div className='flex justify-end order-2 w-full lg:order-1 lg:w-[50%]'>
          <div className='flex flex-col w-[100%] justify-start pt-8 pl-12 pr-8 border-r 2xl:max-w-[754px]'>
            <h1 className='text-left text-[36px]/8 my-8'>What we do</h1>
            <p className='text-md mb-6 font-light'>Send secrets instantly and securely.</p>
            <ul className="list-none list-outside ml-7">
              <li className="pl-4 info-list-item relative">
                <p className='text-lg leading-10 font-semibold'>Secure Communication</p>
                <p className='text-md leading-8 font-light'>
                  Our single-access messaging ensures private and confidential conversations. Track opened messages to see who accessed your chats.
                </p>
              </li>
              <li className='mt-6 pl-4 info-list-item relative'>
                <p className='text-lg leading-8 font-semibold'>Encrypted Browser Security</p>
                <p className='text-md leading-8 font-light'>
                  We use advanced browser encryption to keep your messages safe, making it impossible for hackers and even our team to access them.
                </p>
              </li>
              <li className='mt-6 pl-4 info-list-item relative'>
                <p className='text-lg leading-8 font-semibold'>Protection from Breaches</p>
                <p className='text-md leading-8 font-light'>
                  Your information is untouchable from data breaches and leaks as the shared secrets expires after use.
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div className='flex justify-end order-1 w-full lg:order-1 lg:w-[50%]'>
          some content on the right
        </div>
      </div>
    </MainLayout>
  );
}
