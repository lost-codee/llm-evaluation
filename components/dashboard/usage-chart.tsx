'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { LogEntry, Provider } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UsageChartProps {
  data: LogEntry[];
  models: string[];
  providers: Provider[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
  selectedModel,
  selectedProvider,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-2">
        <p className="text-sm font-medium">
          {new Date(label).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <div className="space-y-1">
          {selectedModel !== 'all' && (
            <p className="text-xs text-muted-foreground">
              Model: <span className="font-medium">{selectedModel}</span>
            </p>
          )}
          {selectedProvider !== 'all' && (
            <p className="text-xs text-muted-foreground">
              Provider: <span className="font-medium">{selectedProvider}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Tokens:{' '}
            <span className="font-medium">
              {payload[0]?.value.toLocaleString()}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Cost:{' '}
            <span className="font-medium">${payload[1]?.value.toFixed(4)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function UsageChart({ data, models, providers }: UsageChartProps) {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  if (!data || data.length === 0 || !models || !providers) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data available
      </div>
    );
  }

  // Process data for the chart
  const chartData = useMemo(() => {
    // Get the date range for the last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6); // Get 7 days including today

    // Initialize all days of the week with zero values
    const weekData: Record<string, any> = {};
    for (let d = new Date(lastWeek); d <= today; d.setDate(d.getDate() + 1)) {
      weekData[d.toISOString().split('T')[0]] = {
        date: d.toISOString(),
        tokens: 0,
        cost: 0,
        ...(selectedModel !== 'all' && { model: selectedModel }),
        ...(selectedProvider !== 'all' && { provider: selectedProvider }),
      };
    }

    // Filter data by selected model, provider and last 7 days
    const filteredData = data
      .filter(
        (entry) => selectedModel === 'all' || entry.model === selectedModel
      )
      .filter(
        (entry) =>
          selectedProvider === 'all' || entry.provider.name === selectedProvider
      )
      .filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= lastWeek && entryDate <= today;
      });

    // Aggregate data by date
    filteredData.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
      if (weekData[dateKey]) {
        weekData[dateKey].tokens += entry.usage?.totalTokens || 0;
        weekData[dateKey].cost += entry.usage?.cost || 0;
      }
    });

    // Convert to array and sort by date
    return Object.values(weekData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data, selectedModel, selectedProvider]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={'all'} value={'all'}>
              All Providers
            </SelectItem>
            {providers.map((provider, index) => (
              <SelectItem key={provider.id + index} value={provider.name}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={'all'} value={'all'}>
              All Models
            </SelectItem>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString('en-US', {
                weekday: 'short',
              })
            }
            className="text-xs"
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            label={{
              value: 'Tokens',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            label={{
              value: 'Cost ($)',
              angle: 90,
              position: 'insideRight',
              style: { textAnchor: 'middle' },
            }}
          />
          <Tooltip
            content={(props) => (
              <CustomTooltip
                {...props}
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
              />
            )}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="tokens"
            fill="#8884d8"
            name="Tokens"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="cost"
            fill="#82ca9d"
            name="Cost ($)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
