"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface ViewLogButtonProps {
  id: string
}

export function ViewLogButton({ id }: ViewLogButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push(`/logs/${id}`)}
    >
      <Eye className="h-4 w-4" />
    </Button>
  )
}
