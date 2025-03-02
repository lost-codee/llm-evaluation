"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dataset } from "@/types"
import { exportDatasetToExcel } from "@/app/actions/export"

// UI
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"


interface ExportDatasetButtonProps {
    dataset: Dataset
}

export function ExportDatasetButton({ dataset }: ExportDatasetButtonProps) {
    const [exporting, setExporting] = useState<string | null>(null)

    const { toast } = useToast();


    const handleExport = async (dataset: Dataset) => {
        try {
            setExporting(dataset.id);
            const result = await exportDatasetToExcel({
                name: dataset.name,
                data: dataset.data
            });

            // Convert base64 to Blob
            const byteCharacters = atob(result.buffer);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${dataset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dataset.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Success",
                description: `Exported ${result.totalRows} rows to Excel`,
            });
        } catch (error) {
            console.error('Failed to export dataset:', error);
            toast({
                title: "Error",
                description: "Failed to export dataset",
                variant: "destructive",
            });
        } finally {
            setExporting(null);
        }
    };



    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => handleExport(dataset)}
            disabled={exporting === dataset.id}
        >
            <Download className={`w-4 h-4 ${exporting === dataset.id ? 'animate-pulse' : ''}`} />
        </Button>
    )
}
