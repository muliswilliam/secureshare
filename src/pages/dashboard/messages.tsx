import React from 'react'
import Link from 'next/link'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getAuth } from '@clerk/nextjs/server'

// utils
import prisma from '../../lib/prisma'
import { SerializedEvent, SerializedMessage } from '../../shared/types'

// components
import { AppHead } from '../../components/Head'
import { MainNav } from '../../components/nav'
import { ContentWrapper } from '../../layouts/content-wrapper'
import { Button } from '../../components/ui/button'
import { MessagesList } from '../../components/messages-list'



type MessagesPageProps = {
  messages: SerializedMessage[]
  events: SerializedEvent[]
}

export const getServerSideProps = (async ({ req }) => {
  const { userId } = getAuth(req)

  const messages = await prisma.message.findMany({
    where: {
      userId
    }
  })

  const events = await prisma.event.findMany({
    where: {
      eventData: {
        path: ['userId'],
        equals: userId as string
      }
    }
  })

  const serializedMessage: SerializedMessage[] = messages.map((msg) => ({
    ...msg,
    expiresAt: msg.expiresAt.toISOString(),
    createdAt: msg.createdAt.toISOString()
  }))

  const serializedEvents: SerializedEvent[] = events.map((event) => ({
    ...event,
    timestamp: event.timestamp.toISOString()
  }))

  return { props: { messages: serializedMessage, events: serializedEvents } }
}) satisfies GetServerSideProps<MessagesPageProps>

export default function Messages({
  messages,
  events
}: InferGetServerSidePropsType<typeof getServerSideProps>) {


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
