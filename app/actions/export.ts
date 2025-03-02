'use server'

import { getLogs } from "./logs"
import * as XLSX from 'xlsx'

export async function exportLogsToExcel(rowLimit?: number): Promise<{ buffer: string; totalRows: number }> {
  try {
    // Get total count first
    const allLogs = await getLogs(1, 1);
    const totalRows = allLogs.total;

    // Get the actual data with limit if specified
    const logs = await getLogs(1, rowLimit || totalRows);

    // Transform data for Excel
    const data = logs.items.map(entry => ({
      Timestamp: new Date(entry.createdAt).toLocaleString(),
      Model: entry.model,
      Duration: entry.duration,
      'Total Tokens': entry.usage?.totalTokens || 0,
      'Prompt Tokens': entry.usage?.promptTokens || 0,
      'Completion Tokens': entry.usage?.completionTokens || 0,
      Cost: entry.usage?.cost ? `$${entry.usage.cost.toFixed(4)}` : '$0.0000',
      'System Prompt': entry.systemPrompt || '',
      Prompt: entry.prompt || '',
      Response: entry.response || '',
      FunctionResults: entry.functionResults && JSON.stringify(entry.functionResults) || '',
      // FunctionCalls: entry.functionCalls && JSON.stringify(entry.functionCalls) || '',
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Add column widths
    const colWidths = [
      { wch: 20 }, // Timestamp
      { wch: 15 }, // Model
      { wch: 10 }, // Duration
      { wch: 12 }, // Total Tokens
      { wch: 12 }, // Prompt Tokens
      { wch: 15 }, // Completion Tokens
      { wch: 10 }, // Cost
      { wch: 10 }, // Status
      { wch: 30 }, // Error Message
      { wch: 40 }, // System Prompt
      { wch: 40 }, // Prompt
      { wch: 40 }  // Response
    ]
    ws['!cols'] = colWidths

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Logs')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })

    return { buffer, totalRows }
  } catch (error) {
    console.error('Error exporting logs:', error)
    throw new Error('Failed to export logs')
  }
}


export async function exportDatasetToExcel(dataset: { name: string, data: any[] }): Promise<{ buffer: string; totalRows: number }> {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dataset.data)

    // Add column widths based on content
    const maxWidth = 50 // Maximum column width
    const colWidths: { wch: number }[] = []

    if (dataset.data.length > 0) {
      const headers = Object.keys(dataset.data[0])
      headers.forEach(header => {
        const headerLength = header.length
        const maxContentLength = Math.max(
          ...dataset.data.map(row =>
            String(row[header] || '').length
          )
        )
        colWidths.push({ wch: Math.min(Math.max(headerLength, maxContentLength), maxWidth) })
      })
      ws['!cols'] = colWidths
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Dataset')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })

    return {
      buffer,
      totalRows: dataset.data.length
    }
  } catch (error) {
    console.error('Error exporting dataset:', error)
    throw error
  }
}
