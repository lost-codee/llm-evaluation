"use server"

import { CreateProviderDialog } from "@/components/settings/create-provider-dialog"
import { ProvidersTable } from "@/components/settings/providers-table"
import { getProviders } from "../../actions/providers"

export default async function SettingsPage() {
  const providers = await getProviders()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and configurations
          </p>
        </div>
        <CreateProviderDialog />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Providers</h2>
          <p className="text-sm text-muted-foreground">
            Manage your LLM providers and API keys
          </p>
        </div>
        <div className="border rounded-lg">
          <ProvidersTable providers={providers} />
        </div>
      </div>
    </div>
  )
}
