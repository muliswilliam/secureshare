import * as z from 'zod'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Loader2, Paperclip, X } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { addTimeToDate, uint8ArrayToBase64UrlSafe } from '../shared/utils'

import { Button } from '@/components/ui/button'
import { EncryptionDetails } from '../shared/types'
import Keychain from '../shared/keychain'
import { Message } from '@prisma/client'
import RandomGenerator from '../shared/random-generator'
import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { encryptFile, encryptText } from '../shared/encrypt-decrypt'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const fileSchema =
  typeof File !== 'undefined' ? z.instanceof(File).optional() : z.any()

const MAX_FILE_SIZE = 10000000

const formSchema = z.object({
  message: z
    .string()
    .min(1, {
      message: 'Message must be at least 1 character'
    })
    .or(z.literal(''))
    .optional(),
  file: fileSchema,
  autoDeletePeriod: z.enum(['day', 'week', 'month'], {
    required_error: 'You need to select auto delete period'
  })
})

interface MessageFormProps {
  // eslint-disable-next-line no-unused-vars
  onSubmit?: (url: string) => void
}

export function MessageForm({ onSubmit: onFormSubmit }: MessageFormProps) {
  // state
  const [submitting, setSubmitting] = React.useState<boolean>(false)

  // refs
  const inputRef = React.useRef<HTMLInputElement>(null)

  // hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      file: undefined
    }
  })

  // methods
  const handleButtonClick = React.useCallback(() => {
    inputRef.current?.click()
  }, [inputRef])

  const onSubmit = React.useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
        setSubmitting(true)
        const encryptionKey = RandomGenerator.generateRandomBytes(
          Keychain.KEY_LENGTH_IN_BYTES
        )
        const secretKey = uint8ArrayToBase64UrlSafe(encryptionKey)
        const encryptionDetails: EncryptionDetails = {
          version: 1,
          cipher: Keychain.ALGORITHM.split('-')[0],
          mode: Keychain.ALGORITHM.split('-')[1],
          tagLength: Keychain.TAG_LENGTH_IN_BYTES * 8,
          ct: ''
        }

        if (values.file) {
          const file: File = values.file
          const { encryptedFile, iv } = await encryptFile(file, encryptionKey)
          const formData = new FormData()
          formData.append('file', encryptedFile)
          const uploadResponse = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
          })
          const { url, completed } = await uploadResponse.json()
          encryptionDetails.ct = iv
          encryptionDetails.fileHandle = {
            completed,
            url
          }
        } else if (values.message) {
          const encryptedText = await encryptText(
            values.message || '',
            encryptionKey
          )
          encryptionDetails.ct = encryptedText
        }

        const response = await fetch('/api/msg/new', {
          method: 'POST',
          body: JSON.stringify({
            encryptionDetails: JSON.stringify(encryptionDetails),
            expiresAt: addTimeToDate(1, values.autoDeletePeriod)
          })
        })
        const msg: Message = await response.json()
        const publicId = msg.publicId
        const url = `${window.location.origin}/${publicId}#${secretKey}`
        if (onFormSubmit) {
          onFormSubmit(url)
        }
        setSubmitting(false)
      } catch (error) {
        setSubmitting(false)
        console.error(error)
      }
    },
    [onFormSubmit]
  )

  return (
    <>
      <h1 className="text-xl lg:text-2xl xl:text-3xl text-left py-4 md:py-8 font-bold">
        Your secret message
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-[3px] top-[2px] focus-visible:none hover:bg-transparent"
                      onClick={handleButtonClick}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Type your message or attach a file here"
                      className="pl-12 pt-2"
                      {...field}
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={() => (
              <div className="grid w-full gap-1.5 relative">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    form.resetField('file')
                    if (e.target.files?.length) {
                      const file = e.target.files[0]
                      if (file.size < MAX_FILE_SIZE) {
                        form.clearErrors('file')
                        form.setValue('file', file)
                      } else {
                        form.setError(
                          'file',
                          { message: 'Maximum allowed file size is 10Mb' },
                          { shouldFocus: true }
                        )
                      }
                    }
                  }}
                  ref={inputRef}
                />
                <div className="flex items-center flex-row gap-2 my-2 h-8">
                  {form.getValues().file && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {form.getValues().file.name}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue('file', undefined)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {form.formState.errors.file && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.file.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="autoDeletePeriod"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="flex justify-start lg:justify-center pb-2">
                  Auto delete this message in:
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col lg:flex-row w-full justify-start lg:justify-center lg:gap-10"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="day" />
                      </FormControl>
                      <FormLabel className="font-normal">1 day</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="week" />
                      </FormControl>
                      <FormLabel className="font-normal">1 week</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="month" />
                      </FormControl>
                      <FormLabel className="font-normal">1 month</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="flex justify-start lg:justify-center" />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-10 w-full" size="lg">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encrypt Message
          </Button>
        </form>
      </Form>
    </>
  )
}
