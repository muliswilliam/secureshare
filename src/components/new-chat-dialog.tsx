import React from 'react'
import { useRouter } from 'next/router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from './ui/form'
import { Input } from './ui/input'
import { generateRoomId, uint8ArrayToBase64UrlSafe } from '../shared/utils'
import RandomGenerator from '../shared/random-generator'
import Keychain from '../shared/keychain'

export default function NewChatDialog ({ open, onClose }: { open: boolean, onClose: () => void }) {
  const router = useRouter()
  const { roomName } = router.query as { roomName: string | undefined }
  const form = useForm<{
    name?: string
  }>({
    defaultValues: {
      name: ''
    }
  })

  const onSubmit = async (data: { name?: string }) => {
    const encryptionKey = RandomGenerator.generateRandomBytes(
      Keychain.KEY_LENGTH_IN_BYTES
    )
    const secretKey = uint8ArrayToBase64UrlSafe(encryptionKey)
    const { name } = data
    router.push(
      {
        pathname: '/chats/' + roomName || generateRoomId(),
        hash: secretKey,
        query: {
          username: name || 'Anonymous'
        }
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        form.reset()
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[425px] top-[300px]">
        <DialogHeader className="text-xl text-center">
          Join the chat
        </DialogHeader>
        <div className="flex flex-col w-full justify-center items-center">
          <Form {...form}>
            <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        className="focus:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant="default"
                type="submit"
                className="mt-6 disabled:bg-accent"
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
  )
}
