'use server';

import { BenchmarkRequest, BenchmarkResult, LLMResponse } from '@/types';
import { similarity } from '@/lib/metrics';
import { parseJSONContent } from '@/lib/utils';
import { handleError, ValidationError } from '@/lib/errors';

// Maximum number of concurrent requests per provider
const MAX_CONCURRENT_REQUESTS = 3;

async function processDatasetItem(
  item: any,
  provider: any,
  model: string,
  promptFile: any
) {
  try {
    // Validate inputs
    if (!item || !provider || !model || !promptFile) {
      throw new ValidationError(
        'Missing required parameters for dataset processing'
      );
    }

    // Replace placeholders in the prompt template
    let prompt = promptFile.content;
    for (const [key, value] of Object.entries(item)) {
      prompt = prompt.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value?.toString() || ''
      );
    }

    // Replace variables in function calls if they exist
    let functions = promptFile.functionCalls;
    if (functions) {
      functions = functions?.map((func: any) => {
        let funcStr = JSON.stringify(func);
        const varRegex = /\${([^}]+)}/g;
        funcStr = funcStr.replace(varRegex, (match, varName) => {
          const value = item[varName];
          return value !== undefined ? value.toString() : match;
        });
        return JSON.parse(funcStr);
      });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/llm${provider.source === 'custom' ? '/custom' : ''}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model,
          provider,
          functions,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    const result = (await response.json()) as LLMResponse;

    // Get the completion content
    const completionContent = result.functionResults
      ? JSON.stringify(parseJSONContent(JSON.stringify(result.functionResults)))
      : result.content;

    // Calculate similarity
    const similarityScore = item.expected
      ? similarity(completionContent, item.expected)
      : 0;

    return {
      success: true,
      data: {
        prompt: prompt,
        completion: completionContent,
        expected: item.expected,
        similarity: similarityScore,
        duration: result.duration,
        cost: result.usage?.cost || 0,
        tokens: {
          prompt: result.usage?.promptTokens || 0,
          completion: result.usage?.completionTokens || 0,
        },
      },
    };
  } catch (error) {
    console.error(`Error processing dataset item:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
    };
  }
}

export async function createBenchmarks({
  dataset,
  providerModels,
  promptFile,
}: BenchmarkRequest): Promise<BenchmarkResult[]> {
  try {
    // Validate inputs
    if (!dataset || dataset.length === 0) {
      throw new ValidationError('Dataset is required and cannot be empty');
    }
    if (!providerModels || providerModels.length === 0) {
      throw new ValidationError('At least one provider model is required');
    }
    if (!promptFile || !promptFile.content) {
      throw new ValidationError('Prompt file with content is required');
    }

    const results: BenchmarkResult[] = [];

    // Process each provider-model pair
    for (const { provider, models } of providerModels) {
      // Process each model
      for (const model of models) {
        const modelResults: BenchmarkResult = {
          model,
          providerName: provider.name,
          providerSource: provider.source,
          responses: [],
          semanticSimilarity: 0,
          duration: 0,
          tokenCount: 0,
          cost: 0,
        };

        // Process dataset items in parallel batches
        for (let i = 0; i < dataset.length; i += MAX_CONCURRENT_REQUESTS) {
          const batch = dataset.slice(i, i + MAX_CONCURRENT_REQUESTS);
          const batchPromises = batch.map((item) =>
            processDatasetItem(item, provider, model, promptFile)
          );

          // Wait for all requests in the batch to complete
          const batchResults = await Promise.allSettled(batchPromises);

          // Process results and handle errors
          batchResults.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.success) {
              const response = result.value.data;
              if (!response) {
                throw new Error('Response is undefined');
              }
              modelResults.responses.push(response);

              // Update model-level metrics
              modelResults.semanticSimilarity += response.similarity;
              modelResults.duration += response.duration;
              modelResults.tokenCount +=
                response.tokens.prompt + response.tokens.completion;
              modelResults.cost += response.cost;
            } else {
              // Log error but continue processing
              const error =
                result.status === 'fulfilled'
                  ? result.value.error
                  : result.reason;
              console.error(`Failed to process item:`, error);

              // Add failed response with error information
              modelResults.responses.push({
                prompt: 'Error processing request',
                completion: error,
                expected: '',
                similarity: 0,
                duration: 0,
                cost: 0,
                tokens: { prompt: 0, completion: 0 },
              });
            }
          });

          // Optional: Add delay between batches to respect rate limits
          if (i + MAX_CONCURRENT_REQUESTS < dataset.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        // Calculate averages for model-level metrics
        const numResponses = modelResults.responses.length;
        if (numResponses > 0) {
          modelResults.semanticSimilarity /= numResponses;
          modelResults.duration /= numResponses;
        }

        results.push(modelResults);
      }
    }
    return results;
  } catch (error) {
    handleError(error);
  }
}
