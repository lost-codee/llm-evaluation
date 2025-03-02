import { formatDistanceToNow } from 'date-fns';
import { Provider } from '@/types';

// UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteProviderButton } from './delete-provider-button';
import { EditProviderDialog } from './edit-provider-dialog';

interface ProvidersTableProps {
  providers?: Provider[];
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  if (!providers || providers?.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No providers found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead>Models</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => (
          <TableRow key={provider.id}>
            <TableCell>{provider.name}</TableCell>
            <TableCell>{provider.source}</TableCell>
            <TableCell>
              {provider.token ? (
                <span className="flex items-center">
                  {provider.token.slice(0, 8)}
                  <span className="mb-1">...</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Not set</span>
              )}
            </TableCell>
            <TableCell>{provider.models.join(', ')}</TableCell>
            <TableCell>
              {provider.lastUsed &&
                formatDistanceToNow(new Date(provider.lastUsed), {
                  addSuffix: true,
                })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <EditProviderDialog provider={provider} />
                <DeleteProviderButton providerId={provider.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
