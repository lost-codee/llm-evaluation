'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createDataset } from '@/app/actions/datasets';
import { useRouter } from 'next/navigation';

interface CSVData {
  [key: string]: string;
}

export function CreateDatasetDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, '')); // Set name to filename without extension
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !name) return;
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      Papa.parse(text, {
        delimiter,
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            setError('Error parsing CSV: ' + results.errors[0].message);
            return;
          }

          const data = results.data as CSVData[];
          if (data.length === 0) {
            setError('CSV file is empty');
            return;
          }

          try {
            await createDataset(name, data);
            setOpen(false);
            setName('');
            setFile(null);
            setDelimiter(',');
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create dataset');
          }
        },
        error: (error: Error) => {
          setError('Error parsing CSV: ' + error.message);
        }
      });
    } catch (error) {
      setError('Error reading file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Dataset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dataset</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create a new dataset for batch evaluations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dataset name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delimiter">Delimiter</Label>
            <Select value={delimiter} onValueChange={setDelimiter}>
              <SelectTrigger>
                <SelectValue placeholder="Select delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,)</SelectItem>
                <SelectItem value=";">Semicolon (;)</SelectItem>
                <SelectItem value="\t">Tab</SelectItem>
                <SelectItem value="|">Pipe (|)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!file || !name || loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
