"use client"

import { useEffect, useState } from 'react'
import { FileWithChildren } from '@/types'
import { getFunctionCallsByFileId } from '@/app/actions/function-calls'

// UI
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { python } from '@codemirror/lang-python'
import { EditorView } from '@codemirror/view'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Loader2 } from 'lucide-react'
import { Switch } from './ui/switch'
import { Play } from 'lucide-react';


const editorTheme = EditorView.theme({
    '&': {
        height: '100%',
        fontSize: '14px'
    },
    '.cm-scroller': {
        fontFamily: 'monospace',
        lineHeight: '1.6'
    }
})

const defaultJsonTemplate = [
    {
        "name": "example_function",
        "description": "Example function description",
        "parameters": {
            "type": "object",
            "required": ["param1"],
            "properties": {
                "param1": {
                    "type": "string",
                    "description": "Description of param1"
                }
            }
        }
    }
]

const defaultPythonTemplate = `# Generate your JSON array using Python code
# The last expression should be a JSON string
import json
import sys

functions = []
for i in range(3):
    print(f"Debug: Processing index {i}", file=sys.stderr, flush=True)
    functions.append({
        "name": f"example_function_{i}",
        "description": f"Example function description {i}",
        "parameters": {
            "type": "object",
            "required": ["param1"],
            "properties": {
                "param1": {
                    "type": "string",
                    "description": f"Description of param{i}"
                }
            }
        }
    })

result = json.dumps(functions)
print("Debug: JSON string:", result, file=sys.stderr, flush=True)
print(result, flush=True)  # Print to stdout for capture
`

export type StructuredOutputProps = {
    file: FileWithChildren | null
    setFunctionCalls: (functionCalls: string) => void
}

export function StructuredOutput({ file, setFunctionCalls }: StructuredOutputProps) {
    const [jsonContent, setJsonContent] = useState<string>('')
    const [pythonContent, setPythonContent] = useState<string>(defaultPythonTemplate)
    const [isPythonMode, setIsPythonMode] = useState(false)
    const [isRunningPython, setIsRunningPython] = useState(false)
    const [consoleOutput, setConsoleOutput] = useState<string>('')
    const [isValidJson, setIsValidJson] = useState<boolean>(true)

    const runPython = async () => {
        setIsRunningPython(true)
        setConsoleOutput('Running Python code...\n')
        try {
            const response = await fetch('/api/execute-python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: pythonContent }),
            });

            const result = await response.json();

            if (!response.ok) {
                setConsoleOutput(prev => prev + `Error: ${result.error}\n`);
                return;
            }

            // Format and display the result
            const output = JSON.stringify(result.data, null, 2);
            setConsoleOutput(prev => prev + `Output:\n${output}\n`);

            // Update JSON content but don't save it yet
            setJsonContent(output);
            setFunctionCalls(JSON.parse(output));
        } catch (error) {
            setConsoleOutput(prev => prev + `Error: ${error}\n`);
        } finally {
            setIsRunningPython(false)
        }
    }

    const handleOnChange = (value: string) => {
        if (isPythonMode) {
            setPythonContent(value)
        }
        else {
            try {
                JSON.parse(value)
                setJsonContent(value)
                setFunctionCalls(JSON.parse(value))
            } catch {
                setIsValidJson(false)
            }
        }
    }

    useEffect(() => {
        const loadFunctionCalls = async () => {
            if (file?.id) {
                try {
                    const calls = await getFunctionCallsByFileId(file.id)
                    if (calls && calls.length > 0) {
                        setJsonContent(JSON.stringify(calls[0], null, 2))
                        setIsPythonMode(false)
                        setIsValidJson(true)
                    } else {
                        // Set default templates
                        setJsonContent(JSON.stringify(defaultJsonTemplate, null, 2))
                        setPythonContent(defaultPythonTemplate)
                    }
                } catch (error) {
                    console.error('Error loading function calls:', error)
                    setJsonContent(JSON.stringify(defaultJsonTemplate, null, 2))
                    setPythonContent(defaultPythonTemplate)
                    setIsValidJson(false)
                }
            }
        }

        loadFunctionCalls()
    }, [file])

    if (!file) {
        return null;
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="border-b p-2 flex items-center justify-between h-14">
                <div className="flex items-center gap-2">
                    <Label>Python Mode</Label>
                    <Switch
                        checked={isPythonMode}
                        onCheckedChange={() => setIsPythonMode(!isPythonMode)}
                    />
                </div>
                {isPythonMode && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={runPython}
                        disabled={isRunningPython}
                        className="gap-2"
                    >
                        {isRunningPython ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        Run
                    </Button>
                )}
            </div>
            {!isValidJson && (
                <div className="p-2 text-red-500">Invalid JSON</div>
            )}
            <div className="flex-1 relative min-w-0 overflow-auto grid grid-rows-[1fr,auto]">
                <CodeMirror
                    value={isPythonMode ? pythonContent : jsonContent}
                    height="100%"
                    width="100%"
                    extensions={[isPythonMode ? python() : json(), editorTheme]}
                    theme="dark"
                    onChange={handleOnChange}
                    basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        history: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        defaultKeymap: true,
                        searchKeymap: true,
                    }}
                />
                {isPythonMode && (
                    <div className="bg-gray-900 p-4 border-t border-gray-700 text-white font-mono text-sm  whitespace-pre">
                        {consoleOutput || 'Python output will appear here...'}
                    </div>
                )}
            </div>
        </div>)
}
