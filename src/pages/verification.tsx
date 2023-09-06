import { MagicLinkErrorCode, isMagicLinkError, useClerk } from '@clerk/nextjs'
import React from 'react'
// Handle magic link verification results. This is
// the final step in the magic link flow.

export default function Verification () {
  const [
    verificationStatus, 
    setVerificationStatus,
  ] = React.useState("loading");
  
  const { handleMagicLinkVerification } = useClerk();
  
  React.useEffect(() => {
    async function verify() {
      try {
        await handleMagicLinkVerification({
          redirectUrl: "/",
          redirectUrlComplete: "/",
        });
        // If we're not redirected at this point, it means
        // that the flow has completed on another device. 
        setVerificationStatus("verified");
      } catch (err) {
        // Verification has failed.
        let status = "failed";
        if (isMagicLinkError(err) && err.code === MagicLinkErrorCode.Expired) {
          status = "expired";
        }
        setVerificationStatus(status);
      }
    }
    verify();
  }, [handleMagicLinkVerification]);
  
  if (verificationStatus === "loading") {
    return <div>Loading...</div>
  }
  
  if (verificationStatus === "failed") {
    return (
      <div>Magic link verification failed</div>
    );
  }
  
  if (verificationStatus === "expired") {
    return (
      <div>Magic link expired</div>
    );
  }
  
  return (
    <div>Successfully signed in. Return to the original tab to continue.</div>
  )
}