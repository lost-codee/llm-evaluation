import { Brain, Clock, DollarSign, MessageSquare } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UsageChart } from "@/components/dashboard/usage-chart"
import { getLogsByDateRange } from "../actions/logs";
import { getProviders } from "../actions/providers";
import { Provider } from "@/types";

export default async function DashboardPage() {
  // Get 1 week history for the dashboard
  const logs = await getLogsByDateRange(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  )

  const providers = await getProviders()
  const models: string[] = providers.reduce((sum: string[], provider: Provider) => {
    return [...sum, ...provider.models]
  }, [])

  // Calculate total stats
  const [averageDuration, totalCost, totalTokens] = logs.reduce((sum, entry) => {
    return [
      sum[0] + (entry.duration || 0),
      sum[1] + (entry.usage?.cost || 0),
      sum[2] + (entry.usage?.totalTokens || 0),
    ]
  }, [0, 0, 0]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your LLM usage and costs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageDuration < 1000
                ? `${Math.round(averageDuration)}ms`
                : `${(averageDuration / 1000).toFixed(2)}s`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(4)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <UsageChart data={logs} models={models} providers={providers} />
        </CardContent>
      </Card>
    </div>
  )
}
