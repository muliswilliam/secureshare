import React from 'react'
import { Message } from '@prisma/client'
import { format } from 'date-fns'
import { Loader2, MoreVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'

// utils
import { EventType, MessageStatus } from '../shared/enums'
import { MessageEvent, SerializedEvent, SerializedMessage } from '../shared/types'

// components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { useToast } from './ui/use-toast'


export const MessagesList = ({
  messages,
  events
}: { messages: SerializedMessage[], events: SerializedEvent[] }) => {
  const [isLogsDialogOpen, setIsLogsDialogOpen] = React.useState<boolean>(false)
  const [currentLogs, setCurrentLogs] = React.useState<SerializedEvent[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState<boolean>(false)
  const [currentMessage, setCurrentMessage] = React.useState<SerializedMessage | null>(null)

  // hooks
  const form = useForm<{ note: string }>({
    defaultValues: {
      note: currentMessage?.note || ''
    }
  })
  const { toast } = useToast()
  const router = useRouter();

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

  const eventTypeToText = (eventType: string) => {
    switch (eventType) {
      case EventType.MessageCreated:
        return 'Created'
      case EventType.MessageExpired:
        return 'Expired'

      case EventType.MessageViewed:
        return 'Viewed'
      default:
        return 'Unknown'
    }
  }


  const messageEventMap = React.useMemo(() => {
    const map: { [publicId: string]: SerializedEvent[] } = {}
    messages.forEach((msg) => {
      events.forEach((e) => {
        const { eventData } = e
        const { publicId } = eventData as Message
        if (publicId === msg.publicId) {
          if (map[msg.publicId]) {
            map[msg.publicId].push(e)
          } else {
            map[msg.publicId] = [e]
          }
        }
      })
    })
    return map
  }, [messages, events])

  // sort messages by created date
  const sortedMessages = React.useMemo(() => {
    return messages.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [messages])

  // sort currentLogs by timestamp
  const sortedLogs = React.useMemo(() => {
    return currentLogs.sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    })
  }, [currentLogs])

  const onSubmit = React.useCallback(async ({ note }: { note: string }) => {
    if (!currentMessage) return
    try {
      const { id } = currentMessage
      const res = await fetch(`/api/msg/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      })
      await res.json()
      setIsEditDialogOpen(false)
      setCurrentMessage(null)
      form.reset()
      // refresh page props
      router.replace(router.asPath)
      toast({
        title: "Message updated",
        description: "Your message has been updated successfully.",
      })
    } catch (error) {
      console.error(error)
    }
  }, [currentMessage, form, router, toast])

  const onDelete = React.useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/msg/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      await res.json()
      // refresh page props
      router.replace(router.asPath)
      toast({
        title: "Message deleted",
        description: "Your message has been deleted successfully.",
      })
    } catch (error) {
      console.error(error)
    }
  }, [router, toast])

  React.useEffect(() => {
    if (!currentMessage) return
    form.setValue('note', currentMessage?.note || '')
  }, [currentMessage, form])

  return (
    <>
      <Table className="border table-auto">
        <TableCaption>A list of your recent messages.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Logs</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMessages.map(
            ({ id, publicId, note, status, expiresAt, createdAt }) => (
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
                  {format(new Date(expiresAt), 'M/dd/yyyy')}
                </TableCell>
                <TableCell>
                  {format(new Date(createdAt), 'M/dd/yyyy')}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="hover:stroke-primary" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentMessage(
                            messages.find((msg) => msg.id === id)!
                          )
                          setIsEditDialogOpen(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentLogs(messageEventMap[publicId])
                          setIsLogsDialogOpen(true)
                        }}
                      >
                        View logs
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
      <Dialog
        open={isLogsDialogOpen}
        onOpenChange={() => setIsLogsDialogOpen((open) => !open)}
      >
        <DialogContent className="sm:max-w-[425px] top-[300px]">
          <DialogHeader className="text-xl text-center">
            Message Logs
          </DialogHeader>
          <div className="flex flex-col w-full justify-center items-center mt-4 gap-4">
            {sortedLogs.map(({ eventType, timestamp, eventData }) => (
              <div
                key={timestamp}
                className="flex flex-col w-full bg-accent p-6 rounded-md gap-2"
              >
                <div className="flex w-full justify-between items-center">
                  <span className="font-light text-md text-sm">
                    {eventTypeToText(eventType)}
                  </span>
                  <span className="font-light text-md text-sm">
                    {format(new Date(timestamp), 'M/dd/yyyy pp')}
                  </span>
                </div>
                <span className="font-light text-sm">
                  IP Address:{' '}
                  {(eventData as unknown as MessageEvent)?.ipAddress}
                </span>
                <span className="font-light text-xs">
                  Device: {(eventData as unknown as MessageEvent)?.ipAddress}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isEditDialogOpen && currentMessage !== null}
        onOpenChange={() => {
          setIsEditDialogOpen((open) => !open)
          setCurrentMessage(null)
          form.reset()
        }}
      >
        <DialogContent className="sm:max-w-[425px] top-[300px]">
          <DialogHeader className="text-xl text-center">
            Edit Message
          </DialogHeader>
          <div className="flex flex-col w-full justify-center items-center">
            <Form {...form}>
              <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a note to your message"
                          {...field}
                          {...form.register('note', {
                            required: true,
                            minLength: 2,
                            maxLength: 100
                          })}
                        />
                      </FormControl>
                      <FormDescription>Maximum length: 100</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="default"
                  type="submit"
                  className="mt-4 disabled:bg-accent"
                  disabled={!form.formState.isValid}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      Submitting
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
