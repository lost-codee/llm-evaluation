'use server';

import { Card } from '@/components/ui/card';
import { LogEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { getLogEntry } from '@/app/actions/logs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function LogPage(props: LogPageProps) {
    const params = await props.params;
    let entry: LogEntry | null = null;

    const id = await params.id;
    entry = await getLogEntry(id);

    if (!entry) {
        return <div>Log not found</div>
    }


    return (
        <div className="container mx-auto p-4">
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">Log Details</h2>
                            <div className="flex items-center gap-2">
                                <Badge>{entry.type}</Badge>
                                <Badge variant="outline">{entry.provider.name}</Badge>
                                <Badge variant="secondary">{entry.model}</Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {entry.systemPrompt && (
                            <div className="space-y-2">
                                <Label>System Prompt</Label>
                                <Card className="p-4 bg-muted">
                                    <pre className="whitespace-pre-wrap font-mono text-sm">
                                        {entry.systemPrompt}
                                    </pre>
                                </Card>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Prompt</Label>
                            <Card className="p-4 bg-muted">
                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                    {entry.prompt}
                                </pre>
                            </Card>
                        </div>

                        {entry.type === 'function' && (
                            <div className="space-y-4">
                                {entry.functionCalls &&
                                    <div className="space-y-2">
                                        <Label>Function Definitions</Label>
                                        <ScrollArea className="h-[300px]">
                                            <Card className="p-4 bg-muted">
                                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                                    {JSON.stringify(entry.functionCalls, null, 2)}
                                                </pre>
                                            </Card>
                                        </ScrollArea>
                                    </div>
                                }

                                {entry.functionResults && entry.type === 'function' &&
                                    <div className="space-y-2">
                                        <Label>Function Results</Label>
                                        <ScrollArea className="h-[200px]">
                                            <Card className="p-4 bg-muted">
                                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                                    {JSON.stringify(entry.functionResults, null, 2)}
                                                </pre>
                                            </Card>
                                        </ScrollArea>
                                    </div>
                                }
                            </div>
                        )}

                        {entry.response && (
                            <div className="space-y-2">
                                <Label>Response</Label>
                                <Card className="p-4 bg-muted">
                                    <pre className="whitespace-pre-wrap font-mono text-sm">
                                        {entry.response}
                                    </pre>
                                </Card>
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-4">
                            <Card className="p-4">
                                <p className="text-sm font-medium text-muted-foreground">Tokens</p>
                                <p className="mt-1 font-mono text-lg">
                                    {entry.usage?.totalTokens || 0}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {entry.usage?.promptTokens || 0} prompt + {entry.usage?.completionTokens || 0} completion
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm font-medium text-muted-foreground">Cost</p>
                                <p className="mt-1 font-mono text-lg">
                                    ${entry.usage?.cost?.toFixed(6) || '0.00'}
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                <p className="mt-1 font-mono text-lg">
                                    {entry.duration}ms
                                </p>
                            </Card>
                            <Card className="p-4">
                                <p className="text-sm font-medium text-muted-foreground">Type</p>
                                <p className="mt-1 font-mono text-lg">
                                    {entry.type}
                                </p>
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
