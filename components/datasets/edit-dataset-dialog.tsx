'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateDataset } from '@/app/actions/datasets';

// UI
import { Pencil } from 'lucide-react';
import { Dataset } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';


interface EditDatasetDialogProps {
  dataset: Dataset;
}

export function EditDatasetDialog({ dataset }: EditDatasetDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(dataset.name);
  const [data, setData] = useState(() => {
    const parsedData = typeof dataset.data === 'string' ? JSON.parse(dataset.data) : dataset.data;
    return JSON.stringify(parsedData, null, 2);
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate JSON
      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData)) {
        throw new Error('Data must be an array of objects');
      }

      // Validate that all items have the same structure as the first item
      if (parsedData.length > 0) {
        const firstItemKeys = Object.keys(parsedData[0]).sort().join(',');
        const invalidItems = parsedData.find(item =>
          Object.keys(item).sort().join(',') !== firstItemKeys
        );
        if (invalidItems) {
          throw new Error('All items must have the same structure');
        }
      }

      await updateDataset(dataset.id, {
        name,
        data: parsedData,
      });


      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dataset');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <DialogContent className="max-w-[90vw] md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Dataset</DialogTitle>
          <DialogDescription>
            Make changes to your dataset. The data must be a valid JSON array of objects with consistent structure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data (JSON)</Label>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <Textarea
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="font-mono"
                rows={20}
              />
            </ScrollArea>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
