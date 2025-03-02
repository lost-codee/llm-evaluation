'use server';

import { db } from '@/lib/db';
import { Dataset } from '@/types';

export async function getDatasets(): Promise<Dataset[]> {
  const datasets = await db.dataset.findMany();
  const result = datasets.map((dataset) => ({
    ...dataset,
    data: JSON.parse(dataset.data),
  }));
  return result;
}

export async function createDataset(
  name: string,
  data: Record<string, any>[]
): Promise<Dataset> {
  const dataset = await db.dataset.create({
    data: {
      name,
      data: JSON.stringify(data),
    },
  });
  return {
    ...dataset,
    data: JSON.parse(dataset.data),
  };
}

export async function deleteDataset(id: string): Promise<void> {
  await db.dataset.delete({
    where: {
      id,
    },
  });
}

export async function updateDataset(
  id: string,
  updates: { name?: string; data?: Record<string, any>[] }
): Promise<Dataset> {
  const dataset = await db.dataset.update({
    where: {
      id,
    },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.data && { data: JSON.stringify(updates.data) }),
    },
  });
  return {
    ...dataset,
    data: JSON.parse(dataset.data),
  };
}
