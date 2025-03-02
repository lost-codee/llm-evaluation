import { getFile } from '../../actions/files';

// UI
import { ParametersPanel } from '@/components/prompts/parameters-panel';
import Playground from '@/components/playground';

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: { fileId: string };
}) {
  const { fileId } = await searchParams;

  if (!fileId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a file to edit
      </div>
    );
  }

  const file = await getFile(searchParams.fileId);

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        File not found
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0">
        <Playground file={file} />
      </div>
      <div className="w-[400px] flex-shrink-0 border-l p-4">
        <ParametersPanel file={file} />
      </div>
    </div>
  );
}
