"use client"

import { useState } from "react"
import { PROVIDER_SOURCES } from "@/lib/constants"
import { ProviderSource } from "@/types"
import { createProvider } from "@/app/actions/providers"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// UI
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export type ProviderFormData = {
  name: string
  source: ProviderSource
  token?: string
  endpoint?: string
  models: string[]
}

export function CreateProviderDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modelsInput, setModelsInput] = useState('')
  const [formData, setFormData] = useState<Omit<ProviderFormData, 'models'>>({
    name: '',
    source: 'openai',
    token: '',
    endpoint: '',
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const models = modelsInput.split(',').map(m => m.trim()).filter(Boolean)
      await createProvider({
        ...formData,
        models
      })
      setOpen(false)
      setFormData({ name: '', source: 'openai', token: '', endpoint: '' })
      setModelsInput('')
      router.refresh()
      toast({
        title: "Success",
        description: "Provider created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create provider",
        variant: "destructive"
      })
      console.error('Failed to create provider:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof Omit<ProviderFormData, 'models'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isCustom = formData.source === 'custom'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Provider</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Provider</DialogTitle>
          <DialogDescription>
            Add a new LLM provider with your API key
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My OpenAI Provider"
                value={formData.name}
                onChange={(e) =>
                  handleChange('name', e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value: ProviderSource) =>
                  handleChange('source', value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_SOURCES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isCustom && (
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  placeholder="http://localhost:11434"
                  value={formData.endpoint || ''}
                  onChange={(e) =>
                    handleChange('endpoint', e.target.value)
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The URL where your Ollama instance is running
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="token">API Key</Label>
              <Input
                id="token"
                type="password"
                placeholder="sk-..."
                value={formData.token}
                onChange={(e) =>
                  handleChange('token', e.target.value)
                }
                required={!isCustom}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="models">Available Models</Label>
              <Input
                id="models"
                placeholder="gpt-4-turbo, gpt-3.5-turbo, mistral-large"
                value={modelsInput}
                onChange={(e) => setModelsInput(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter model names separated by commas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
