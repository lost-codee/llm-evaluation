'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  BenchmarkResult,
  Dataset,
  Provider,
  FunctionCall,
  FileWithChildren,
} from '@/types';
import { getFunctionCallsByFileId } from '../../actions/function-calls';
import { getProviders } from '../../actions/providers';
import { getPromptFiles } from '../../actions/files';
import { createBenchmarks } from '../../actions/benchmark';

// UI
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DatasetPicker } from '@/components/datasets/dataset-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Play } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JSONFormatter } from '@/components/ui/json-formatter';
import { DiffFormatter } from '@/components/ui/diff-formatter';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { DatasetPreviewDialog } from '@/components/datasets/dataset-preview-dialog';
import { PromptPreviewDialog } from '@/components/prompts/prompt-preview-dialog';

interface ProviderModels {
  provider: Provider;
  selectedModels: string[];
}

export default function BenchmarkPage() {
  const { toast } = useToast();
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedPromptFile, setSelectedPromptFile] =
    useState<FileWithChildren | null>(null);
  const [promptFiles, setPromptFiles] = useState<FileWithChildren[]>([]);
  const [functionCalls, setFunctionCalls] = useState<FunctionCall[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerModels, setProviderModels] = useState<ProviderModels[]>([]);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const providers = await getProviders();
        if (!providers || providers.length === 0) {
          toast({
            title: 'No providers available',
            description: 'Please add providers to run benchmarks',
            variant: 'destructive',
          });
          return;
        }

        setProviders(providers);
        setProviderModels(
          providers.map((p) => ({ provider: p, selectedModels: [] }))
        );

        const promptFiles = await getPromptFiles();
        setPromptFiles(promptFiles);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPromptFile) {
      getFunctionCallsByFileId(selectedPromptFile.id)
        .then(setFunctionCalls)
        .catch(console.error);
    } else {
      setFunctionCalls([]);
    }
  }, [selectedPromptFile]);

  const toggleModel = (providerId: string, model: string) => {
    setProviderModels((current) =>
      current.map((pm) => {
        if (pm.provider.id === providerId) {
          const selectedModels = pm.selectedModels.includes(model)
            ? pm.selectedModels.filter((m) => m !== model)
            : [...pm.selectedModels, model];
          return { ...pm, selectedModels };
        }
        return pm;
      })
    );
  };

  const startBenchmark = async () => {
    if (!selectedDataset || !selectedPromptFile) return;

    const selectedProviderModels = providerModels
      .filter((pm) => pm.selectedModels.length > 0)
      .map((pm) => ({
        provider: pm.provider,
        models: pm.selectedModels,
      }));

    if (selectedProviderModels.length === 0) return;

    setIsRunning(true);
    try {
      console.log({ functionCalls });
      const response = await createBenchmarks({
        dataset: selectedDataset.data,
        providerModels: selectedProviderModels,
        promptFile: {
          id: selectedPromptFile.id,
          name: selectedPromptFile.name,
          content: selectedPromptFile.content || '',
          functionCalls:
            functionCalls.length > 0 ? functionCalls[0] : undefined,
        },
      });

      if (!response) {
        throw new Error('Failed to run benchmark');
      }

      setResults(response);
    } catch (error) {
      console.error('Benchmark error:', error);
      toast({
        title: 'Benchmark failed',
        description:
          error instanceof Error ? error.message : 'Failed to run benchmark',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Model Benchmarking</h1>
        <Button
          onClick={startBenchmark}
          disabled={
            isRunning ||
            !selectedDataset ||
            !selectedPromptFile ||
            !providerModels.some((pm) => pm.selectedModels.length > 0)
          }
          size="lg"
        >
          {isRunning ? (
            'Running...'
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Benchmark
            </>
          )}
        </Button>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6 items-center max-w-2xl">
          <div>
            <label className="text-sm font-medium mb-2 block">Dataset</label>
            <DatasetPicker
              value={selectedDataset}
              onChange={setSelectedDataset}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Prompt File
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedPromptFile?.id || ''}
                  onValueChange={(id) => {
                    const file = promptFiles.find((f) => f.id === id);
                    setSelectedPromptFile(file || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a prompt file" />
                  </SelectTrigger>
                  <SelectContent>
                    {promptFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPromptFile && (
                <PromptPreviewDialog file={selectedPromptFile} />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-4 block">
            Available Models
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="border rounded-lg p-4 bg-background/40"
              >
                <div className="font-medium mb-3 pb-2 border-b">
                  {provider.name}
                </div>
                <div className="grid gap-2">
                  {provider.models.map((model) => (
                    <div
                      key={model}
                      className="flex items-center gap-3 px-2 py-1 hover:bg-accent rounded-md"
                    >
                      <Checkbox
                        id={`${provider.id}-${model}`}
                        checked={providerModels
                          .find((pm) => pm.provider.id === provider.id)
                          ?.selectedModels.includes(model)}
                        onCheckedChange={() => toggleModel(provider.id, model)}
                      />
                      <label
                        htmlFor={`${provider.id}-${model}`}
                        className="text-sm font-medium leading-none cursor-pointer select-none flex-1"
                      >
                        {model}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isRunning ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-8">
            {/* Summary Table */}
            <div className="border rounded-lg overflow-hidden bg-background/40">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Model Summary</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Model</TableHead>
                      <TableHead className="w-[120px]">Similarity</TableHead>
                      <TableHead className="w-[120px]">Avg. Duration</TableHead>
                      <TableHead className="w-[100px]">Tokens</TableHead>
                      <TableHead className="w-[100px]">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate">
                          {result.model}
                        </TableCell>
                        <TableCell>
                          {(result.semanticSimilarity * 100).toFixed(2)}%
                        </TableCell>
                        <TableCell>{result.duration.toFixed(0)}ms</TableCell>
                        <TableCell>{result.tokenCount}</TableCell>
                        <TableCell>${result.cost.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="diff-toggle"
                  checked={showDiff}
                  onCheckedChange={setShowDiff}
                />
                <Label htmlFor="diff-toggle">
                  {showDiff ? 'Showing diffs' : 'Show diffs'}
                </Label>
              </div>
            </div>

            {/* Detailed Results Section */}
            <div className="border rounded-lg overflow-hidden bg-background/40">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Detailed Results</h2>
                <div className="relative rounded-md border">
                  {/* Fixed Header */}
                  <div className="absolute top-0 left-0 right-0 bg-background border-b z-20">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="sticky left-0 bg-background z-30 after:absolute after:right-0 after:top-0 after:h-full after:w-[1px] after:bg-border"
                            style={{ width: '300px', minWidth: '300px' }}
                          >
                            Prompt
                          </TableHead>
                          {results.some((result) =>
                            result.responses.some((r) => r?.expected)
                          ) && (
                            <TableHead
                              style={{ width: '300px', minWidth: '300px' }}
                            >
                              Expected Response
                            </TableHead>
                          )}
                          {results.map((result) => (
                            <TableHead
                              key={result.model}
                              style={{ width: '300px', minWidth: '300px' }}
                            >
                              {result.model}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>

                  {/* Scrollable Content */}
                  <div
                    className="overflow-auto"
                    style={{
                      maxHeight: 'calc(100vh - 600px)',
                      marginTop: '41px', // Height of the header
                    }}
                  >
                    <Table>
                      <TableBody>
                        {selectedDataset?.data.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell
                              className="sticky left-0 bg-background whitespace-pre-wrap break-words after:absolute after:right-0 after:top-0 after:h-full after:w-[1px] after:bg-border"
                              style={{ width: '300px', minWidth: '300px' }}
                            >
                              {results[0]?.responses[index]?.prompt}
                            </TableCell>
                            {data.expected && (
                              <TableCell
                                style={{ width: '300px', minWidth: '300px' }}
                              >
                                <JSONFormatter content={data.expected} />
                              </TableCell>
                            )}
                            {results.map((result) => (
                              <TableCell
                                key={result.model}
                                style={{ width: '300px', minWidth: '300px' }}
                              >
                                {showDiff && data.expected ? (
                                  <DiffFormatter
                                    expected={data.expected}
                                    actual={
                                      result.responses[index]?.completion || ''
                                    }
                                  />
                                ) : (
                                  <JSONFormatter
                                    content={
                                      result.responses[index]?.completion || ''
                                    }
                                  />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] border rounded-lg bg-background/40">
            <p className="text-muted-foreground">No results available</p>
          </div>
        )}
      </div>
    </div>
  );
}
