'use server';

import { LLMCallParams, LLMResponse } from '@/types';

export async function sendLLMRequest({
  provider,
  model,
  messages,
  functions,
}: LLMCallParams): Promise<LLMResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: 0, // Don't cache model data
    },
    body: JSON.stringify({
      provider,
      model,
      messages,
      functions,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send LLM request');
  }

  const data = await response.json();
  return data;
}

export async function sendCustomRequest({
  provider,
  model,
  messages,
  functions,
}: LLMCallParams): Promise<LLMResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/llm/custom`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 0, // Don't cache model data
      },
      body: JSON.stringify({
        provider,
        model,
        messages,
        functions,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to send LLM request');
  }

  const data = await response.json();
  return data;
}
