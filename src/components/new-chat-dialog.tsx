import React from 'react'
import { useRouter } from 'next/router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { generateRoomId } from '../shared/utils'

export const NewChatDialog = ({ open }: { open: boolean }) => {
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
    const { name } = data
    router.push({
      pathname: '/chats/' + roomName || generateRoomId(),
      query: {
        username: name || 'Anonymous'
      }
    })
  }

  return (
    <Dialog
        open={open}
        onOpenChange={() => {
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
                  name='name'
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className='focus:ring-0'
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