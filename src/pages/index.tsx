import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Secure Share</title>
        <meta name='description' content='Share passwords securely.' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <h1 className='text-3xl font-bold underline'>Share passwords securely</h1>

      <button className='inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900'>
        Share now
      </button>
    </>
  );
}
