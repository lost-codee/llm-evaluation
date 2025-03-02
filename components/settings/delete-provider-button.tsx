"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteProvider } from "@/app/actions/providers"
import { useRouter } from "next/navigation"

interface DeleteProviderButtonProps {
  providerId: string
}

export function DeleteProviderButton({ providerId }: DeleteProviderButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteProvider(providerId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete provider:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
