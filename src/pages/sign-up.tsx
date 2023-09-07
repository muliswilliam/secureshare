import { SignUp } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"
import MainLayout from "../layouts/main";

export default function Page() {
  const { theme } = useTheme()
  return (
    <MainLayout>
      <div className="flex flex-row items-center justify-center h-[calc(100vh-334px)]">
        <SignUp
          routing="hash"
          appearance={{
            baseTheme: (theme === 'system' || theme === 'light' ? undefined : dark)
          }}
        />
      </div>
    </MainLayout>
  )
}