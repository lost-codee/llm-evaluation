"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteDataset } from "@/app/actions/datasets"
import { useRouter } from "next/navigation"

interface DeleteDatasetButtonProps {
    datasetId: string
}

export function DeleteDatasetButton({ datasetId }: DeleteDatasetButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteDataset(datasetId)
            router.refresh()
        } catch (error) {
            console.error('Failed to delete dataset:', error)
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
