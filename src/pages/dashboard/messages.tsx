import React from 'react'
import Link from 'next/link'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getAuth } from '@clerk/nextjs/server'

// utils
import prisma from '../../lib/prisma'

// components
import { AppHead } from '../../components/head'
import { MainNav } from '../../components/nav'
import { ContentWrapper } from '../../layouts/content-wrapper'
import { Button } from '../../components/ui/button'
import { MessagesList } from '../../components/messages-list'
import { Message } from '@prisma/client'
import { EventWithIpAddressInfo } from '../../shared/types'



type MessagesPageProps = {
  messages: Message[]
  events: EventWithIpAddressInfo[]
}

export const getServerSideProps = (async ({ req }) => {
  const { userId } = getAuth(req)

  const messages = await prisma.message.findMany({
    where: {
      userId
    }
  }) as Message[]

  const events = await prisma.event.findMany({
    where: {
      eventData: {
        path: ['userId'],
        equals: userId as string
      }
    },
    include: {
      ipAddressInfo: true
    }
  })

  return { props: { messages, events } }
}) satisfies GetServerSideProps<MessagesPageProps>

export default function Messages({
  messages,
  events
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  console.log(events.map(event => event.ipAddressInfo))

  return (
    <>
      <AppHead />
      <MainNav showDashboardMenu />
      <ContentWrapper>
        <div className="flex justify-between items-center py-8">
          <h1 className="text-2xl">My Messages</h1>
          <Link href="/">
            <Button
              variant="outline"
              className="hover:bg-primary hover:text-white"
            >
              Create message
            </Button>
          </Link>
        </div>
        <MessagesList messages={messages} events={events} />
      </ContentWrapper>
    </>
  )
}
