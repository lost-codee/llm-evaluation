"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getProviderModels } from "@/app/actions/providers"
import { Provider } from "@/types"

interface ModelSelectorProps {
  provider: Provider | null
  value: string | null
  onChange: (value: string) => void
}

export function ModelSelector({ provider, value, onChange }: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!provider) {
      setAvailableModels([])
      return
    }

    setLoading(true)
    getProviderModels(provider.id)
      .then(setAvailableModels)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [provider])

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Model</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Model</Label>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={loading || !provider}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
