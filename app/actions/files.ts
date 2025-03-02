'use server';

import { db } from '@/lib/db';
import { FileWithChildren } from '@/types';

export async function getFiles(): Promise<FileWithChildren[]> {
  const files = await db.file.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      functionCalls: {
        select: {
          id: true,
          function: true,
        },
      },
      name: true,
      path: true,
      type: true,
      parentId: true,
      content: true,
    },
  });
  return files as FileWithChildren[];
}

export async function createFile(
  file: Omit<FileWithChildren, 'id'>
): Promise<boolean> {
  await db.file.create({
    data: {
      name: file.name,
      path: file.path,
      content: file.content,
      type: file.type,
      parentId: file.parentId || null,
    },
  });
  return true;
}

export async function deleteFile(id: string): Promise<boolean> {
  try {
    // First, recursively delete all children if this is a folder
    const file = await db.file.findUnique({
      where: { id },
      include: { children: true },
    });

    if (file?.type === 'folder' && file.children.length > 0) {
      // Recursively delete all children
      await db.file.deleteMany({
        where: {
          path: {
            startsWith: file.path,
          },
          id: {
            not: id, // Don't delete the parent yet
          },
        },
      });
    }

    // Now delete the file/folder itself
    await db.file.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function updateContent(
  id: string,
  content: string
): Promise<boolean> {
  try {
    await db.file.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('Error updating file:', error);
    return false;
  }
}

export async function updateName(id: string, name: string): Promise<boolean> {
  try {
    await db.file.update({
      where: { id },
      data: {
        name,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('Error updating file:', error);
    return false;
  }
}

export async function getFile(id: string): Promise<FileWithChildren | null> {
  const file = await db.file.findUnique({
    where: { id },
    include: {
      functionCalls: true,
    },
  });
  return file as FileWithChildren | null;
}

export async function getPromptFiles(): Promise<FileWithChildren[]> {
  const files = await db.file.findMany({
    where: {
      type: 'file',
    },
  });
  return files as FileWithChildren[];
}
