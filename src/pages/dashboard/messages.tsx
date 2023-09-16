import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Message, Event } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'
import { format } from 'date-fns'

// utils
import prisma from "../../lib/prisma";
import { MessageStatus } from "../../shared/enums";

// components
import { AppHead } from "../../components/Head";
import { MainNav } from "../../components/nav";
import { ContentWrapper } from "../../layouts/content-wrapper";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "../../components/ui/dialog";
import React from "react";
import Link from "next/link";

interface SerializedMessage extends Omit<Message, 'expiresAt' | 'createdAt'> {
  expiresAt: string
  createdAt: string
}

interface SerializedEvent extends Omit<Event, 'timestamp'> {
  timestamp: string
}

type MessagesPageProps = {
  messages: SerializedMessage[],
  events: SerializedEvent[]
}

export const getServerSideProps = (async ({ params, req }) => {
  const { userId } = getAuth(req)

  const messages = await prisma.message.findMany({
    where: {
      userId
    }
  })

  console.log(userId)

  const events = await prisma.event.findMany({
    where: {
      eventData: {
        path: ['userId'],
        equals: userId as string
      }
    }
  })

  const serializedMessage: SerializedMessage[] = messages.map(msg => ({
    ...msg,
    expiresAt: msg.expiresAt.toISOString(),
    createdAt: msg.createdAt.toISOString()
  }))

  const serializedEvents: SerializedEvent[] = events.map((event) => ({
    ...event,
    timestamp: event.timestamp.toISOString(),
  }))
  
  return { props: { messages: serializedMessage, events: serializedEvents } }
}) satisfies GetServerSideProps<MessagesPageProps>

export default function Messages({
  messages,
  events
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [isLogsDialogOpen, setIsLogsDialogOpen] = React.useState<boolean>(false)
  const [currentLogs, setCurrentLogs] = React.useState<SerializedEvent[]>([])

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case MessageStatus.SEEN:
        return <Badge variant="default">Seen</Badge>
      case MessageStatus.EXPIRED:
        return <Badge variant="destructive">Expired</Badge>
      case MessageStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const messageEventMap: {[publicId: string]: SerializedEvent[] } = {}
  
  messages.forEach((msg) => {
   events.forEach(e => {
    const { eventData } = e
    const { publicId } = eventData as any
    if (publicId === msg.publicId) {
      if(messageEventMap[msg.publicId]) {
        messageEventMap[msg.publicId].push(e)
      } else {
        messageEventMap[msg.publicId] = [e]
      }
    }
   })
  })

  return (
    <>
      <AppHead />
      <MainNav showDashboardMenu />
      <ContentWrapper>
        <div className="flex justify-between items-center py-8">
        <h1 className="text-2xl">My Messages</h1>
        <Link href='/'>
          <Button variant="outline" className="hover:bg-primary hover:text-white">Create message</Button>
        </Link>
        </div>
        <Table className="border rounded-sm">
          <TableCaption>A list of your recent messages.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Logs</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map(
              ({
                id,
                publicId,
                note,
                status,
                expiresAt,
                createdAt
              }) => (
                <TableRow key={id}>
                  <TableCell>{renderMessageStatus(status)}</TableCell>
                  <TableCell>Notify when opened</TableCell>
                  <TableCell>
                    {messageEventMap[publicId] &&
                    messageEventMap[publicId].length > 0 ? (
                      <a
                        className="hover:underline cursor-pointer"
                        onClick={() => {
                          setCurrentLogs(messageEventMap[publicId])
                          setIsLogsDialogOpen(true)
                        }}
                      >
                        View logs
                      </a>
                    ) : (
                      'No logs'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{note}</TableCell>
                  <TableCell>
                    {format(new Date(expiresAt), 'M-dd-yyyy pp')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(createdAt), 'M-dd-yyyy pp')}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </ContentWrapper>
      <Dialog
        open={isLogsDialogOpen}
        onOpenChange={() => setIsLogsDialogOpen((open) => !open)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="text-xl text-center">
            Message Logs
          </DialogHeader>
          <div className="flex flex-col justify-center items-center">
            <pre>{JSON.stringify(currentLogs, null, 2)}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


