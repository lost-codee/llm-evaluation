'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileWithChildren } from '@/types';
import { useRouter } from 'next/navigation';

// UI
import { StructuredOutput } from '@/components/structured-output';
import { PromptEditor } from '@/components/prompt-editor';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { updateContent } from '@/app/actions/files';
import { createFunctionCall } from '@/app/actions/function-calls';

export type PlaygroundProps = {
  file: FileWithChildren;
};

export default function Playground({ file }: { file: FileWithChildren }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState('');
  const [functionCalls, setFunctionCalls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Handle initial state and hydration
  useEffect(() => {
    setIsClient(true);
    setContent(file.content || '');
    setFunctionCalls(file.functionCalls || '');
  }, []);

  // Update local state when file prop changes
  useEffect(() => {
    if (isClient) {
      setContent(file.content || '');
      setFunctionCalls(file.functionCalls || '');
      setIsDirty(false);
    }
  }, [file, isClient]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const handleFunctionCallsChange = (newFunctionCalls: string) => {
    setFunctionCalls(newFunctionCalls);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (!file || file.type !== 'file') return;

      const promises = [];
      if (content !== file.content) {
        promises.push(updateContent(file.id, content));
      }
      if (functionCalls !== file.functionCalls) {
        promises.push(createFunctionCall(file.id, functionCalls));
      }

      await Promise.all(promises);
      setIsDirty(false);
      router.refresh(); // Refresh the page to get updated data
    } catch (error) {
      console.error('Error saving file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex flex-col border-b">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Label>{file.name}</Label>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          Loading playground...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Label>{file.name}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isLoading || !isDirty}
            >
              {isLoading ? 'Saving...' : isDirty ? 'Save*' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
      <Tabs defaultValue="prompt">
        <TabsList>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="structured">Structured Output</TabsTrigger>
        </TabsList>
        <TabsContent value="prompt">
          <PromptEditor
            file={file}
            content={content}
            setContent={handleContentChange}
          />
        </TabsContent>
        <TabsContent value="structured">
          <StructuredOutput
            file={file}
            setFunctionCalls={handleFunctionCallsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
