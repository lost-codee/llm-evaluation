'use server';

import { LogEntry, Provider } from '@/types';
import { db } from '@/lib/db';
import { handleError } from '@/lib/errors';

export interface PaginatedLogs {
  items: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getLogs(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedLogs> {
  try {
    const entries = await db.logs.findMany({
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        provider: true,
      },
    });

    // If database is not connected, entries will be null
    if (!entries) {
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const total = await db.logs.count();

    return {
      items: entries.map((entry) => ({
        ...entry,
        provider: entry.provider as Provider,
      })) as LogEntry[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return {
      items: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

export async function getLogEntry(id: string): Promise<LogEntry | null> {
  try {
    const entry = await db.logs.findUnique({
      where: {
        id: id,
      },
      include: {
        provider: true,
      },
    });

    if (!entry) {
      return null;
    }

    return {
      ...entry,
      provider: entry.provider as Provider,
    } as LogEntry;
  } catch (error) {
    console.error('Failed to fetch log entry:', error);
    return null;
  }
}

export async function getLogsByDateRange(
  start: Date,
  end: Date
): Promise<LogEntry[]> {
  try {
    const entries = await db.logs.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        provider: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If database is not connected, entries will be null
    if (!entries) {
      return [];
    }

    return entries.map((entry) => ({
      ...entry,
      provider: entry.provider as Provider,
    })) as LogEntry[];
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return []; // Return empty array instead of throwing to prevent page crash
  }
}
