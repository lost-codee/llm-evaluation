'use server';

import { formatDistanceToNow } from 'date-fns';
import { getLogs } from '../../actions/logs';

// UI
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ViewLogButton } from '@/components/logs/view-log-button';
import { ExportLogsButton } from '@/components/logs/export-logs-button';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page || '1');
  const pageSize = Number(params.pageSize || '10');
  const logs = await getLogs(page, pageSize);

  if (logs.total === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Logs</h1>
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">No logs entries available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            View your LLM request logs and details
          </p>
        </div>
        <ExportLogsButton />
      </div>
      <div className="rounded-md border">
        <ScrollArea className="max-h-[calc(100vh-250px)] rounded-md overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-background sticky top-0">Timestamp</TableHead>
                <TableHead className="bg-background sticky top-0">Type</TableHead>
                <TableHead className="bg-background sticky top-0">Provider</TableHead>
                <TableHead className="bg-background sticky top-0">Model</TableHead>
                <TableHead className="bg-background sticky top-0">Duration</TableHead>
                <TableHead className="bg-background sticky top-0">Tokens</TableHead>
                <TableHead className="bg-background sticky top-0">Cost</TableHead>
                <TableHead className="bg-background sticky top-0 w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.items.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.type === 'function' ? 'default' : 'secondary'}>
                      {entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.provider.name}</Badge>
                  </TableCell>
                  <TableCell>{entry.model}</TableCell>
                  <TableCell>{entry.duration}ms</TableCell>
                  <TableCell>
                    {entry.usage?.totalTokens || 0}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({entry.usage?.promptTokens || 0}p + {entry.usage?.completionTokens || 0}c)
                    </span>
                  </TableCell>
                  <TableCell>
                    ${entry.usage?.cost?.toFixed(6) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <ViewLogButton id={entry.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, logs.total)} of {logs.total} entries
        </p>
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/logs?page=${page - 1}&pageSize=${pageSize}`} />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, logs.totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              const isCurrentPage = pageNumber === page;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href={`/logs?page=${pageNumber}&pageSize=${pageSize}`}
                    isActive={isCurrentPage}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {logs.totalPages > 5 && page < logs.totalPages && (
              <>
                {page < logs.totalPages - 4 && (
                  <PaginationItem>
                    <span className="px-4">...</span>
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    href={`/logs?page=${logs.totalPages}&pageSize=${pageSize}`}
                  >
                    {logs.totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            {page < logs.totalPages && (
              <PaginationItem>
                <PaginationNext href={`/logs?page=${page + 1}&pageSize=${pageSize}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
