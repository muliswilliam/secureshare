import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Paperclip, X } from 'lucide-react'
import { useForm } from 'react-hook-form'

const fileSchema =
  typeof File !== 'undefined' ? z.instanceof(File).optional() : z.any()

const formSchema = z.object({
  message: z
    .string()
    .min(1, {
      message: 'Message must be at least 1 character',
    })
    .or(z.literal(''))
    .optional(),
  file: fileSchema,
  autoDeletePeriod: z.enum(['day', 'week', 'month'], {
    required_error: 'You need to select auto delete period',
  }),
})
export function MessageForm() {
  // refs
  const inputRef = React.useRef<HTMLInputElement>(null)

  // hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      file: undefined,
    },
  })

  // methods
  const handleButtonClick = React.useCallback(() => {
    inputRef.current?.click()
  }, [inputRef])

  const onSubmit = React.useCallback((values: z.infer<typeof formSchema>) => {
    console.log(values)
  }, [])

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
                    if (e.target.files?.length) {
                      form.setValue('file', e.target.files[0])
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
            Encrypt Message
          </Button>
        </form>
      </Form>
    </>
  )
}
