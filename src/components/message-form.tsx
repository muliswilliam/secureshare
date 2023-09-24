import React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Paperclip, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import axios, { AxiosProgressEvent } from 'axios'

// types
import { EncryptionDetails } from '../shared/types'
import { Message } from '@prisma/client'

// utils
import { encryptFile, encryptText } from '../shared/encrypt-decrypt'
import { addTimeToDate, getIpAddressInfo, uint8ArrayToBase64UrlSafe } from '../shared/utils'
import Keychain from '../shared/keychain'
import RandomGenerator from '../shared/random-generator'

// components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'


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

export default function MessageForm({ onSubmit: onFormSubmit }: MessageFormProps) {
  // state
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState<string>('')

  // refs
  const inputRef = React.useRef<HTMLInputElement>(null)

  // hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      file: undefined,
      autoDeletePeriod: 'week'
    }
  })

  // methods
  const handleButtonClick = React.useCallback(() => {
    inputRef.current?.click()
  }, [inputRef])

  const axiosProgressCallback = (progressEvent: AxiosProgressEvent) =>  {
    if (progressEvent.progress && progressEvent.total) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setProgress(percentCompleted)
    }
  }

  const onSubmit = React.useCallback(
    async (values: z.infer<typeof formSchema>) => {
      try {
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
          setStatus('Encrypting file...')
          const file: File = values.file
          const { encryptedFile, iv } = await encryptFile(file, encryptionKey)
          const formData = new FormData()
          formData.append('file', encryptedFile)
          setStatus('File encrypted successfully...')
          setStatus('Uploading encrypted file....')
          const { data } = await axios.post('/api/files/upload', formData, {
            onUploadProgress: axiosProgressCallback
          })
          const { url, completed } = data
          encryptionDetails.ct = iv
          encryptionDetails.fileHandle = {
            completed,
            fileName: file.name,
            url
          }
        } else if (values.message) {
          setStatus('Encrypting message...')
          const encryptedText = await encryptText(values.message, encryptionKey)
          encryptionDetails.ct = encryptedText
          setStatus('Message encrypted successfully...')
        }

        setStatus('Creating SecureShare link...')
        setProgress(0)
        const ipAddressInfo = await getIpAddressInfo()
        const { data: msg } = await axios.post<Message>(
          '/api/msg/new',
          {
            ipAddressInfo,
            encryptionDetails: JSON.stringify(encryptionDetails),
            expiresAt: addTimeToDate(1, values.autoDeletePeriod)
          },
          { onUploadProgress: axiosProgressCallback }
        )
        const publicId = msg.publicId
        const url = `${window.location.origin}/messages/${publicId}#${secretKey}`
        setStatus('SecureShare link is ready!')
        form.reset()
        if (onFormSubmit) {
          onFormSubmit(url)
        }
      } catch (error) {
        console.error(error)
      }
    },
    [onFormSubmit, form]
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
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encrypt Message
          </Button>
        </form>
      </Form>

      {/* Encrypting dialog */}
      {form.formState.isSubmitting &&
        <Dialog open={true} onOpenChange={() => {}} >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Encrypting your data!</DialogTitle>
              <DialogDescription className="py-2 text-primary">{status}</DialogDescription>
            </DialogHeader>
            <Progress value={progress} />
          </DialogContent>
        </Dialog>
      }
    </>
  )
}
