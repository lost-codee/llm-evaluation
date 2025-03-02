'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dataset } from '@/types';

const MAX_PREVIEW_ROWS = 100;

interface DatasetPreviewDialogProps {
  dataset: Dataset;
}

export function DatasetPreviewDialog({ dataset }: DatasetPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  // Get column headers from the first row
  const data = typeof dataset.data === 'string' ? JSON.parse(dataset.data) : dataset.data;
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  // Limit preview to MAX_PREVIEW_ROWS
  const previewData = data.slice(0, MAX_PREVIEW_ROWS);
  const hasMoreRows = data.length > MAX_PREVIEW_ROWS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      <DialogContent className="max-w-[90vw] md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dataset.name}</DialogTitle>
          <DialogDescription>
            Preview of dataset contents ({data.length} rows, {columns.length} columns)
            {hasMoreRows && ` - Showing first ${MAX_PREVIEW_ROWS} rows`}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[500px] rounded-md border  overflow-x-auto">
          <div className="min-w-[800px ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 sticky left-0 bg-background">#</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column} className="min-w-[150px]">{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row: Record<string, string>, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono sticky left-0 bg-background">{index + 1}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={column} className="max-w-[300px] truncate">
                        {row[column]?.toString() || ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {hasMoreRows && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              {data.length - MAX_PREVIEW_ROWS} more rows not shown
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
