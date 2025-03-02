'use server';

import { db } from '@/lib/db';

export async function createFunctionCall(fileId: string, functionData: any) {
  // Delete all existing function calls for this file
  await db.functionCall.deleteMany({
    where: {
      fileId,
    },
  });

  // Create the new function call with the entire function data as JSON
  return await db.functionCall.create({
    data: {
      function: functionData,
      fileId,
    },
  });
}

export async function getFunctionCallsByFileId(fileId: string) {
  const functionCalls = await db.functionCall.findMany({
    where: {
      fileId,
    },
  });

  // Return the function data directly from the JSON field
  return functionCalls.map((call) => call.function);
}
