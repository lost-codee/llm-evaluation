import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileWithChildren } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface PromptPreviewDialogProps {
  file: FileWithChildren;
}

export function PromptPreviewDialog({ file }: PromptPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
      </Button>

      <DialogContent className="max-w-[90vw] md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>Preview of prompt content</DialogDescription>
        </DialogHeader>

        <div className="h-[500px] rounded-md border">
          <Textarea
            value={file.content || ''}
            readOnly
            className="h-full font-mono text-sm border-0 resize-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
