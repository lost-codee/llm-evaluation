'use client';

import { useEffect, useCallback, useState } from 'react';
import { FileWithChildren } from '@/types';

// UI
import dynamic from 'next/dynamic';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';

// Dynamically import CodeMirror to avoid SSR issues
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
});

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
  },
  '.cm-scroller': {
    fontFamily: 'monospace',
    lineHeight: '1.6',
  },
});

export type EditorProps = {
  file: FileWithChildren | null;
  content: string;
  setContent: (content: string) => void;
};

export function PromptEditor({ file, content, setContent }: EditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
    },
    [setContent]
  );

  if (!file) {
    return null;
  }

  if (!isMounted) {
    return (
      <div className="flex-1 overflow-hidden relative">
        <div className="w-full h-[calc(100vh-100px)] bg-background border rounded-md p-4">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <CodeMirror
        value={content}
        height="calc(100vh - 100px)"
        extensions={[markdown(), EditorView.lineWrapping]}
        onChange={handleChange}
        theme={editorTheme}
        autoFocus
      />
    </div>
  );
}
