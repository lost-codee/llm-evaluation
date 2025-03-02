"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { getProviders } from "@/app/actions/providers"
import { Provider } from "@/types"

interface ProviderSelectorProps {
  value: Provider | null
  onChange: (value: Provider) => void
}

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProviders()
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-2">
      <Label>Provider</Label>
      <Select 
        value={value?.id || ""} 
        onValueChange={(id) => {
          const provider = providers.find(p => p.id === id)
          if (provider) onChange(provider)
        }} 
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading providers..." : "Select a provider"} />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
