import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
    title: 'LLM Evals',
    description: 'Monitor your LLM usage',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster />
            </body>
        </html>
    )
}