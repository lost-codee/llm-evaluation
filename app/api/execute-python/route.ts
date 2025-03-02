import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(req: Request) {
    try {
        const { code } = await req.json();

        // Create a temporary Python script
        const pythonProcess = spawn('python3', ['-c', code]);

        // Promise to collect stdout
        const stdoutPromise = new Promise<string>((resolve) => {
            let output = '';
            pythonProcess.stdout.on('data', (chunk) => {
                const textChunk = chunk.toString('utf8'); // buffer to string
                output += textChunk;
            });
            pythonProcess.stdout.on('end', () => {
                resolve(output);
            });
        });

        // Promise to collect stderr
        const stderrPromise = new Promise<string>((resolve) => {
            let error = '';
            pythonProcess.stderr.on('data', (chunk) => {
                const textChunk = chunk.toString('utf8'); // buffer to string
                error += textChunk;
            });
            pythonProcess.stderr.on('end', () => {
                resolve(error);
            });
        });

        // Promise for process completion
        const exitPromise = new Promise<number>((resolve) => {
            pythonProcess.on('close', (code) => {
                resolve(code ?? 1);
            });
        });

        // Wait for all promises to resolve
        const [outputData, errorData, exitCode] = await Promise.all([
            stdoutPromise,
            stderrPromise,
            exitPromise
        ]);


        if (exitCode !== 0) {
            return NextResponse.json({ error: errorData || 'Python execution failed' }, { status: 500 });
        }

        if (!outputData.trim()) {
            return NextResponse.json({ error: 'No output from Python code' }, { status: 400 });
        }

        try {
            // Parse the output as JSON after trimming whitespace
            const result = JSON.parse(outputData.trim());
            return NextResponse.json({ data: result });
        } catch (error) {
            console.error('Error parsing output:', error);
            return NextResponse.json({
                error: 'Output is not valid JSON',
                output: outputData.trim(),
                outputLength: outputData.length
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Failed to execute Python code' }, { status: 500 });
    }
}
