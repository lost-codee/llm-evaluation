'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDatasets } from '@/app/actions/datasets';
import { Dataset } from '@/types';
import { Button } from '@/components/ui/button';
import { Table as TableIcon } from 'lucide-react';
import { DatasetPreviewDialog } from '@/components/datasets/dataset-preview-dialog';

interface DatasetPickerProps {
  value: Dataset | null;
  onChange: (dataset: Dataset) => void;
}

export function DatasetPicker({ value, onChange }: DatasetPickerProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowLimit, setRowLimit] = useState<number | ''>('');

  useEffect(() => {
    getDatasets()
      .then(setDatasets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDatasetChange = (id: string) => {
    const dataset = datasets.find((d) => d.id === id);
    if (dataset) {
      // Apply row limit if set
      const limitedDataset = {
        ...dataset,
        data: rowLimit ? dataset.data.slice(0, rowLimit) : dataset.data,
      };
      onChange(limitedDataset);
    }
  };

  const handleRowLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit =
      event.target.value === '' ? '' : parseInt(event.target.value, 10);
    setRowLimit(limit);

    // Update current dataset with new limit if one is selected
    if (value) {
      const dataset = datasets.find((d) => d.id === value.id);
      if (dataset) {
        const limitedDataset = {
          ...dataset,
          data: limit ? dataset.data.slice(0, limit) : dataset.data,
        };
        onChange(limitedDataset);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Evaluation Dataset</Label>
        <div className="flex gap-2">
          <Select
            value={value?.id || ''}
            onValueChange={handleDatasetChange}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue
                placeholder={
                  loading ? 'Loading datasets...' : 'Select a dataset'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value && <DatasetPreviewDialog dataset={value} />}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Row Limit (Optional)</Label>
        <Input
          type="number"
          min="1"
          placeholder="Enter number of rows"
          value={rowLimit}
          onChange={handleRowLimitChange}
        />
      </div>

      {value && (
        <p className="text-sm text-muted-foreground">
          {value.data.length} evaluation items
          {rowLimit &&
            value.data.length < Number(rowLimit) &&
            ' (all available items)'}
          {rowLimit &&
            value.data.length >= Number(rowLimit) &&
            ` (limited to ${rowLimit} items)`}
        </p>
      )}
    </div>
  );
}
