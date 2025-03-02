"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Oops! Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2 pb-2">
          <p className="text-sm text-muted-foreground">
            {error.message || "We encountered an error while processing your request"}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={reset}
            className="min-w-[120px]"
          >
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
