'use server';

import { CreateDatasetDialog } from '@/components/datasets/create-dataset-dialog';
import { DatasetsTable } from '@/components/datasets/datasets-table';
import { getDatasets } from '../../actions/datasets';

export default async function DatasetsPage() {
  const datasets = await getDatasets();
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Datasets</h1>
            <p className="text-sm text-gray-500">
              Create and manage datasets for batch evaluations
            </p>
          </div>
          <CreateDatasetDialog />
        </div>
        <div className='border rounded-lg'>
          <DatasetsTable datasets={datasets} />
        </div>
      </div>
    </div>
  );
}
