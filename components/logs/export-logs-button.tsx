'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { exportLogsToExcel } from "@/app/actions/export"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export function ExportLogsButton() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [rowCount, setRowCount] = useState<string>('all')

  const handleExport = async (selectedRowCount: string) => {
    try {
      setLoading(true)
      const limit = selectedRowCount === 'all' ? undefined : parseInt(selectedRowCount)
      const { buffer } = await exportLogsToExcel(limit)

      // Convert base64 to blob
      const byteCharacters = atob(buffer)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `llm-logs-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setOpen(false)
    } catch (error) {
      console.error('Error exporting logs:', error)
      // You might want to add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Logs</DialogTitle>
          <DialogDescription>
            Choose how many rows you want to export to Excel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rows" className="text-right">
              Rows to export
            </Label>
            <Select
              value={rowCount}
              onValueChange={setRowCount}
              disabled={loading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select number of rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
                <SelectItem value="500">500 rows</SelectItem>
                <SelectItem value="1000">1000 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => handleExport(rowCount)}
            disabled={loading}
          >
            {loading ? "Exporting..." : "Export to Excel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
