'use client';

import { useState } from 'react';
import { Provider } from '@/types';
import { updateProvider } from '@/app/actions/providers';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// UI
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

interface EditProviderDialogProps {
  provider: Provider;
}

export function EditProviderDialog({ provider }: EditProviderDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modelsInput, setModelsInput] = useState<string>(
    provider.models.join(', ')
  );
  const [endpoint, setEndpoint] = useState<string | null>(provider.endpoint);
  const [token, setToken] = useState<string>(provider.token || '');

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const models = modelsInput
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
      await updateProvider(provider.id, {
        models,
        endpoint: endpoint || undefined,
        token,
      });
      setOpen(false);
      router.refresh();
      toast({
        title: 'Success',
        description: 'Provider updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update provider',
        variant: 'destructive',
      });
      console.error('Failed to update provider:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Provider Models</DialogTitle>
          <DialogDescription>
            Update the available models for this provider
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <div className="text-sm text-muted-foreground">
                {provider.name} ({provider.source})
              </div>
            </div>

            {provider.source === 'custom' ? (
              <>
                <div className="space-y-2">
                  <Label>Endpoint</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://example.com"
                    value={endpoint || ''}
                    onChange={(e) => setEndpoint(e.target.value)}
                  />
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter API key"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="models">Models</Label>
              <Input
                id="models"
                placeholder="gpt-4, gpt-3.5-turbo"
                value={modelsInput}
                onChange={(e) => setModelsInput(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
