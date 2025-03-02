import { PROVIDER_SOURCES } from '@/lib/constants';
import { ChatCompletionMessageParam } from 'token.js';

export interface FileWithChildren {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content: string | null;
  parentId: string | null;
  children?: FileWithChildren[];
  functionCalls?: any;
}

export interface ProviderFormData {
  name: string;
  source: ProviderSource;
  token?: string;
  endpoint?: string;
  models: string[];
}

export type ProviderSource = keyof typeof PROVIDER_SOURCES;

export interface Provider {
  id: string;
  name: string;
  source: ProviderSource;
  token: string;
  endpoint: string | null;
  models: string[];
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Parameter {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
}

export interface Dataset {
  id: string;
  name: string;
  data: Record<string, any>[];
}

export interface LogEntry {
  id: string;
  prompt: string;
  systemPrompt?: string | null;
  response: string;
  functionCalls?: any | null;
  functionResults?: any | null;
  model: string;
  provider: Provider;
  duration: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
  } | null;
  type: 'prompt' | 'function';
  createdAt: Date;
}

export interface BenchmarkResult {
  providerName: string;
  providerSource: ProviderSource;
  model: string;
  accuracy?: number;
  semanticSimilarity: number;
  duration: number;
  tokenCount: number;
  cost: number;
  responses: Array<{
    prompt: string;
    completion: string;
    expected: string;
    similarity: number;
    duration: number;
    cost: number;
    tokens: {
      prompt: number;
      completion: number;
    };
  }>;
}

export interface BenchmarkRequest {
  dataset: Dataset['data'];
  providerModels: ProviderModelPair[];
  promptFile: {
    id: string;
    name: string;
    content: string;
    functionCalls?: any;
  };
}

export type FunctionCall = any;

export interface ProviderModelPair {
  provider: Provider;
  models: string[];
}

export interface LLMCallParams {
  provider: Provider;
  model: string;
  messages: ChatCompletionMessageParam[];
  functions: any[] | null;
}

export interface LLMResponse {
  id: string;
  content: string;
  functionResults?: any;
  created: number;
  duration: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
  };
  error?: string;
}

export type ResponseStats = {
  tokens: { prompt: number; completion: number; total: number } | null;
  cost: number | null;
  duration: string | null;
};
