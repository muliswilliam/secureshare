import React from 'react'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSignIn, useSignUp } from '@clerk/nextjs'

// components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage
} from '@/components/ui/form'
import { useRouter } from 'next/router'

interface MessageProps {
  open: boolean
  isSignUp: boolean
  onClose: () => void
  toggleSignUp: () => void
}

const formSchema = z.object({
  email: z.string().email('Invalid email address')
})


export function AuthDialog({
  open,
  isSignUp,
  onClose,
  toggleSignUp
}: MessageProps) {
  const [expired, setExpired] = React.useState(false)
  const [verified, setVerified] = React.useState(false)

  // hooks
  const router = useRouter()
  const { signIn, isLoaded } = useSignIn()
  const { signUp, setSession } = useSignUp()
  const signInFlow = signIn?.createMagicLinkFlow();
  const signUpFlow = signUp?.createMagicLinkFlow()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  if (!isLoaded) {
    return null
  }

  const verificationUrl = `${location.origin}/verification`

  async function submitSignUp({ email }: z.infer<typeof formSchema>) {
    if(!signUp || !signUpFlow) return
    setExpired(false);
    setVerified(false);
    
    // Start the sign up flow, by collecting 
    // the user's email address.
    await signUp.create({ emailAddress: email });
    
    // Start the magic link flow.
    // Pass your app URL that users will be navigated
    // when they click the magic link from their
    // email inbox.
    // su will hold the updated sign up object.
    const su = await signUpFlow.startMagicLinkFlow({ 
      redirectUrl: verificationUrl
    });
    
    // Check the verification result.
    const verification = su.verifications.emailAddress;
    if (verification.verifiedFromTheSameClient()) {
      setVerified(true);
      // If you're handling the verification result from 
      // another route/component, you should return here.
      // See the <MagicLinkVerification/> component as an 
      // example below.
      // If you want to complete the flow on this tab, 
      // don't return. Check the sign up status instead.
      return;
    } else if (verification.status === "expired") {
      setExpired(true);
    }
    
    if (su.status === "complete") {
      // Sign up is complete, we have a session.
      // Navigate to the after sign up URL.
      setSession(
        su.createdSessionId, 
        () => router.push("/"),
      );
      return;
    }
  }

    
  async function submitSignIn({ email }: z.infer<typeof formSchema>) {
    if (!signIn || !signInFlow) return
    setExpired(false);
    setVerified(false);
    
    // Start the sign in flow, by collecting 
    // the user's email address.
    const si = await signIn.create({ identifier: email });
    const signInFactor = si.supportedFirstFactors.find(
      ff => ff.strategy === "email_link" && ff.safeIdentifier === email
    ) as { emailAddressId: string }

    if (!signInFactor) return 
    
    // Start the magic link flow.
    // Pass your app URL that users will be navigated
    // res will hold the updated sign in object.
    const res = await signInFlow.startMagicLinkFlow({ 
      emailAddressId: signInFactor.emailAddressId,
      redirectUrl: verificationUrl
    });
      
    // Check the verification result.
    const verification = res.firstFactorVerification;
    if (verification.verifiedFromTheSameClient()) {
      setVerified(true);
      // If you're handling the verification result from 
      // another route/component, you should return here.
      // See the <Verification/> component as an 
      // example below.
      // If you want to complete the flow on this tab, 
      // don't return. Simply check the sign in status.
      return;
    } else if (verification.status === "expired") {
      setExpired(true);
    }
    if (res.status === "complete") {
      // setActive({session:res.createdSessionId)
      //Handle redirect
      return;
    }
  }

  if (expired) {
    return <div>Magic link has expired</div>
  }

  if (verified) {
    return <div>Signed in on other tab</div>
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isSignUp ? 'Sign Up' : 'Login'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-row w-full justify-center items-center gap-2">
          <p className="text-default font-light text-center my-4">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <Button
            onClick={toggleSignUp}
            variant="ghost"
            className="text-primary px-0 hover:bg-transparent"
          >
            Click here
          </Button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(isSignUp ? submitSignUp : submitSignIn)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Your email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="default"
              className="w-full mt-4"
              disabled={!form.formState.isValid}
            >
              {isSignUp ? 'Register' : 'Login'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
