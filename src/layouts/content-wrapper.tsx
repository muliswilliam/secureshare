
export function ContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col mx-auto w-full max-w-screen-xl px-2.5 lg:px-20">
      {children}
    </div>
  )
}