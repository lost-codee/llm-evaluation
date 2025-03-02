import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MODEL_COSTS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const modelCost = MODEL_COSTS[model]
  if (!modelCost) return 0

  return (
    (promptTokens * modelCost.input + completionTokens * modelCost.output) / 1000
  )
}

export const parseJSONContent = (content: string) => {
  try {
    // Remove markdown formatting if present
    const cleanContent = content.replace(/```json\n|\n```/g, '');

    const parsed = JSON.parse(cleanContent);

    // Handle array of function calls
    if (Array.isArray(parsed)) {
      const combined = parsed.reduce((acc, item) => {
        try {
          return item?.function?.arguments
            ? { ...acc, ...JSON.parse(item.function.arguments) }
            : acc;
        } catch {
          return acc;
        }
      }, {});
      return Object.keys(combined).length > 0 ? combined : parsed;
    }

    // Handle single function call
    if (parsed?.function?.arguments) {
      return JSON.parse(parsed.function.arguments);
    }

    return parsed;
  } catch (error) {
    // If parsing fails, try to extract JSON from markdown code block
    try {
      const match = content.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch {
      // If both attempts fail, return original content
      return content;
    }
    return content;
  }
};
