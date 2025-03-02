import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Utils
import { calculateCost } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { provider, model, messages, functions } = body;

    if (!provider || !provider.source || !provider.endpoint) {
      return NextResponse.json(
        { error: 'Invalid provider configuration' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      baseURL: provider.endpoint,
      apiKey: provider.token,
      defaultHeaders: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: provider.token,
      },
    });

    process.env.DEBUG = 'true';
    const completion = await openai.chat.completions.create({
      model,
      messages,
      stream: false,
      tools: functions && functions.length > 0 ? functions : undefined,
    });

    const message = completion.choices[0].message;

    if (!message) {
      return NextResponse.json(
        { error: 'Invalid completion' },
        { status: 400 }
      );
    }

    // Calculate cost if we have the model's pricing
    const cost = calculateCost(
      model,
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0
    );

    // Handle function call response
    let content = message.content;
    let functionResults = message?.tool_calls;

    const usage = completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
          cost,
        }
      : undefined;

    const duration = Date.now() - startTime;

    return NextResponse.json({
      id: completion.id,
      created: completion.created,
      content,
      functionResults,
      duration,
      usage,
    });
  } catch (error: any) {
    console.error('Custom API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to call LLM API' },
      { status: 500 }
    );
  }
}
