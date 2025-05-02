"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Something went wrong!</h2>
        <p className="mb-6 text-muted-foreground">
          We encountered an error while loading the blog maker. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}