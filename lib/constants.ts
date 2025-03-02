export const PROVIDER_SOURCES = {
    "anthropic": "Anthropic",
    "aws": "AWS Bedrock",
    "gemini": "Gemini",
    "mistral": "Mistral",
    "openai": "OpenAI",
    "perplexity": "Perplexity",
    "openrouter": "OpenRouter",
    "custom": "Custom"
} as const;

export const MODEL_SOURCES = {
    "openai": ["gpt-4-turbo-preview", "gpt-4", "gpt-4-32k", "gpt-4-vision-preview", "gpt-4o", "gpt-4o-mini", "o1", "o3-mini", "gpt-3.5-turbo", "gpt-3.5-turbo-16k"],
    "anthropic": ["claude-1", "claude-2"],
    "aws": ["bedrock", "bedrock-ai1"],
    "mistral": ["mistral-1"],
    "perplexity": ["perplexity"],
    "openrouter": ["openrouter"],
    "custom": ["gemma-2:2b", "llama3.1:8b"],
} as const;


// Cost per 1K tokens (in USD)
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
    // OpenAI
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-16k': { input: 0.001, output: 0.002 },
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4o': { input: 0.0025, output: 0.01 },        // Latest GPT-4 with vision
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }, // Cost-efficient small model
    'o1': { input: 0.024, output: 0.072 },          // Frontier reasoning model
    'o3-mini': { input: 0.0015, output: 0.0045 },   // Cost-efficient reasoning model

    // Anthropic
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-2.1': { input: 0.008, output: 0.024 },
    'claude-2': { input: 0.008, output: 0.024 },
    'claude-instant': { input: 0.0008, output: 0.0024 },

    // Google
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 },

    // Mistral
    'mistral-tiny': { input: 0.00014, output: 0.00042 },
    'mistral-small': { input: 0.0006, output: 0.0018 },
    'mistral-medium': { input: 0.002, output: 0.006 },
    'mistral-large': { input: 0.008, output: 0.024 }
}