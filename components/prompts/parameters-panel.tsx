'use client';

import { useState, useEffect } from 'react';
import { FileWithChildren, Parameter, Provider, ResponseStats } from '@/types';
import { ChatCompletionMessageParam } from 'token.js';
import { sendLLMRequest, sendCustomRequest } from '@/app/actions/llm';
import { useToast } from '@/hooks/use-toast';

// UI
import { Loader2, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ProviderSelector } from './provider-selector';
import { ModelSelector } from './model-selector';

export type ParametersPanelProps = {
  file: FileWithChildren;
};

export const ParametersPanel = ({ file }: ParametersPanelProps) => {
  const toaster = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [responseStats, setResponseStats] = useState<ResponseStats | null>(
    null
  );
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [functionResponse, setFunctionResponse] = useState<string | null>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleParameterChange = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    const newParameters = [...parameters];
    newParameters[index] = {
      ...newParameters[index],
      [field]: value,
    };
    setParameters(newParameters);
  };

  const handleRunPrompt = async () => {
    if (!selectedProvider || !selectedModel || !file.content) return;
    setIsLoading(true);

    try {
      const messages: ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      }

      const parametersObj: Record<string, string> = parameters.reduce(
        (acc, param) => ({
          ...acc,
          [param.name]: param.value,
        }),
        {}
      );

      // Add user message with parameters replaced
      let processedPrompt = file.content;
      if (parametersObj) {
        Object.entries(parametersObj).forEach(([key, value]) => {
          processedPrompt = processedPrompt.replace(
            new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
            String(value)
          );
        });
      }

      let processedFunctions =
        file.functionCalls &&
        file.functionCalls.length > 0 &&
        file.functionCalls[0].function;
      if (parametersObj && processedFunctions) {
        processedFunctions = processedFunctions?.map((func: any) => {
          let funcStr = JSON.stringify(func);
          const varRegex = /\${([^}]+)}/g;
          funcStr = funcStr.replace(varRegex, (match, varName) => {
            const value = parametersObj[varName];
            return value !== undefined ? value.toString() : match;
          });
          return JSON.parse(funcStr);
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: processedPrompt,
      });

      let response;
      if (selectedProvider.source === 'custom') {
        response = await sendCustomRequest({
          provider: selectedProvider,
          model: selectedModel,
          messages,
          functions: processedFunctions || null,
        });
      } else {
        response = await sendLLMRequest({
          provider: selectedProvider,
          model: selectedModel,
          messages,
          functions: processedFunctions || null,
        });
      }

      setCurrentResponse(response.content);
      setFunctionResponse(response.functionResults);
      setResponseStats({
        tokens: response.usage
          ? {
              prompt: response.usage.promptTokens,
              completion: response.usage.completionTokens,
              total: response.usage.totalTokens,
            }
          : null,
        cost: response.usage?.cost || null,
        duration: response.duration.toLocaleString(),
      });
    } catch (error: any) {
      console.error('Error:', error);
      toaster.toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update parameters when file content changes
  useEffect(() => {
    if (file?.content) {
      const paramMatches = file.content.match(/{{([^}]+)}}/g) || [];

      // Create a Map to store unique parameters by name
      const uniqueParams = new Map<string, Parameter>();

      // Process each match and only keep unique parameter names
      paramMatches.forEach((match) => {
        const name = match.replace(/[{}]/g, '').trim();
        if (!uniqueParams.has(name)) {
          uniqueParams.set(name, {
            name,
            value: '',
          } as Parameter);
        }
      });

      const functions = file.functionCalls;

      // find params in function calls
      if (functions) {
        functions?.map((func: any) => {
          let funcStr = JSON.stringify(func);
          const varRegex = /\${([^}]+)}/g;
          const matches = funcStr.match(varRegex);
          matches?.map((match) => {
            const name = match.replace(/[${}]/g, '').trim();
            if (!uniqueParams.has(name)) {
              uniqueParams.set(name, {
                name,
                value: '',
              } as Parameter);
            }
          });
        });
      }

      // Convert Map values to array
      const newParams = Array.from(uniqueParams.values());
      setParameters(newParams);
    } else {
      setParameters([]);
    }
  }, [file?.content]);

  return (
    <div className="space-y-4">
      {/* Providers */}
      <div className="space-y-2 mb-4">
        <ProviderSelector
          value={selectedProvider}
          onChange={setSelectedProvider}
        />
      </div>

      {/* Models */}
      <div className="space-y-2 mb-4">
        <ModelSelector
          provider={selectedProvider}
          value={selectedModel}
          onChange={setSelectedModel}
        />
      </div>

      {/* System Prompt */}
      <div className="space-y-2 mb-4">
        <Label>System Prompt</Label>
        <Textarea
          placeholder="Enter system prompt..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />
      </div>

      {/* Parameters */}
      {parameters.length > 0 && (
        <div className="space-y-4 mb-4">
          <Label>Parameters</Label>
          <ScrollArea className="max-h-[300px] rounded-md border p-2 overflow-y-auto">
            <div className="space-y-4">
              {parameters.map((param, index) => (
                <div key={index} className="flex flex-col gap-2 w-full p-2">
                  <Label className="font-mono">{`{{${param.name}}}`}</Label>
                  <Input
                    className="rounded-md border"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) =>
                      handleParameterChange(index, 'value', e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Response */}
      {currentResponse && (
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            {/* Content Response */}
            <Label>Content Response</Label>
            <ScrollArea className="max-h-[400px] w-full rounded-md border overflow-y-auto">
              <div className="p-4 bg-gray-50">
                <pre className="font-mono text-sm w-[300px] whitespace-pre-wrap break-words">
                  {currentResponse}
                </pre>
              </div>
            </ScrollArea>
          </div>
          {/* Function Response */}
          {functionResponse && (
            <div className="space-y-2">
              <Label>Function Response</Label>
              <ScrollArea className="max-h-[400px] w-full rounded-md border overflow-y-auto">
                <div className="p-4 bg-gray-50">
                  <pre className="font-mono text-sm w-[300px] whitespace-pre-wrap break-words">
                    {JSON.stringify(functionResponse, null, 2)}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          )}
          {/* Stats */}
          {responseStats?.tokens && (
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm font-medium text-gray-500">Tokens</p>
                <p className="mt-1 font-mono text-lg">
                  {responseStats.tokens.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {responseStats.tokens.prompt.toLocaleString()} prompt +{' '}
                  {responseStats.tokens.completion.toLocaleString()} completion
                </p>
              </Card>
              {responseStats.cost !== null && (
                <Card className="p-4">
                  <p className="text-sm font-medium text-gray-500">Cost</p>
                  <p className="mt-1 font-mono text-lg">
                    ${responseStats.cost.toFixed(4)}
                  </p>
                </Card>
              )}
              <Card className="p-4">
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="mt-1 font-mono text-lg">
                  {responseStats.duration}
                </p>
              </Card>
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full"
        onClick={handleRunPrompt}
        disabled={!selectedProvider || !selectedModel || !file.content}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Prompt
          </>
        )}
      </Button>
    </div>
  );
};
