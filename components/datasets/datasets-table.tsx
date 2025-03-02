
// UI
import { Dataset } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatasetPreviewDialog } from './dataset-preview-dialog';
import { EditDatasetDialog } from './edit-dataset-dialog';
import { DeleteDatasetButton } from './delete-dataset-button';
import { ExportDatasetButton } from './export-datasets-button';


interface DatasetsTableProps {
  datasets: Dataset[];
}

export function DatasetsTable({ datasets }: DatasetsTableProps) {

  if (!datasets || datasets.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No datasets added yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Rows</TableHead>
          <TableHead className="w-48">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {datasets.map((dataset) => (
          <TableRow key={dataset.id}>
            <TableCell>{dataset.name}</TableCell>
            <TableCell>{dataset.data.length}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <DatasetPreviewDialog dataset={dataset} />
                <EditDatasetDialog dataset={dataset} />
                <ExportDatasetButton dataset={dataset} />
                <DeleteDatasetButton datasetId={dataset.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
