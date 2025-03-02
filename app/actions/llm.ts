'use server';

import { LLMCallParams, LLMResponse } from '@/types';
import { handleError, ValidationError } from '../../lib/errors';
import { db } from '@/lib/db';

export async function sendLLMRequest({
  provider,
  model,
  messages,
  functions,
}: LLMCallParams): Promise<LLMResponse> {
  try {
    // Validate required parameters
    if (!provider || !provider.source) {
      throw new ValidationError('Invalid provider configuration');
    }
    if (!model) {
      throw new ValidationError('Model is required');
    }
    if (!messages || messages.length === 0) {
      throw new ValidationError('At least one message is required');
    }

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    // Log to history
    await db.logs.create({
      data: {
        providerId: provider.id,
        model,
        prompt: messages[messages.length - 1].content?.toString() || '',
        systemPrompt: messages
          .find((m: any) => m.role === 'system')
          ?.content?.toString(),
        response: data.content || '',
        functionCalls: functions as any,
        functionResults: data.functionResults,
        duration: data.duration,
        usage: data.usage,
        type: functions && functions.length > 0 ? 'function' : 'prompt',
      },
    });

    return data;
  } catch (error) {
    handleError(error);
  }
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

  // Log to history
  await db.logs.create({
    data: {
      providerId: provider.id,
      model,
      prompt: messages[messages.length - 1].content?.toString() || '',
      systemPrompt: messages
        .find((m: any) => m.role === 'system')
        ?.content?.toString(),
      response: data.content || '',
      functionCalls: functions as any,
      functionResults: data.functionResults,
      duration: data.duration,
      usage: data.usage,
      type: functions && functions.length > 0 ? 'function' : 'prompt',
    },
  });

  return data;
}
