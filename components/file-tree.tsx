'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileWithChildren } from '@/types';

// UI
import {
  ChevronRight,
  ChevronDown,
  File,
  FolderOpen,
  Folder,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createFile,
  deleteFile,
  getFiles,
  updateName,
} from '@/app/actions/files';

// Helper component for folder/file icons
const NodeIcon = ({
  type,
  expanded,
}: {
  type: 'file' | 'folder';
  expanded?: boolean;
}) => {
  const Icon = type === 'folder' ? (expanded ? FolderOpen : Folder) : File;

  return <Icon className="h-4 w-4 text-gray-500" />;
};

export function FileTree() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<FileWithChildren[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const selectedFileId = searchParams.get('fileId');

  const setSelectedFileId = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('fileId', id);
    } else {
      params.delete('fileId');
    }
    router.push(`/prompts?${params.toString()}`);
  };

  const buildFileTree = (flatFiles: FileWithChildren[]): FileWithChildren[] => {
    const fileMap = new Map<string, FileWithChildren>();
    const rootFiles: FileWithChildren[] = [];

    // First pass: create all file objects with empty children arrays
    flatFiles.forEach((file) => {
      fileMap.set(file.id, { ...file, children: [] });
    });

    // Second pass: build tree structure
    flatFiles.forEach((file) => {
      const fileWithChildren = fileMap.get(file.id)!;
      if (file.parentId) {
        const parent = fileMap.get(file.parentId);
        if (parent) {
          parent.children!.push(fileWithChildren);
        } else {
          rootFiles.push(fileWithChildren);
        }
      } else {
        rootFiles.push(fileWithChildren);
      }
    });

    return rootFiles;
  };

  const fetchFiles = async () => {
    const data = await getFiles();
    if (data) {
      setFiles(buildFileTree(data));
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Auto-expand parent folders of selected file
  useEffect(() => {
    if (selectedFileId) {
      const expandParents = (
        files: FileWithChildren[],
        id: string,
        parents: Set<string>
      ) => {
        for (const file of files) {
          if (file.id === id) {
            return true;
          }
          if (file.children) {
            if (expandParents(file.children, id, parents)) {
              parents.add(file.id);
              return true;
            }
          }
        }
        return false;
      };

      const newExpanded = new Set(expandedFolders);
      expandParents(files, selectedFileId, newExpanded);
      setExpandedFolders(newExpanded);
    }
  }, [selectedFileId, files]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreateRootFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const success = await createFile({
        name: newFolderName.trim(),
        path: `/${newFolderName.trim()}`,
        type: 'folder',
        parentId: null,
        content: null,
      });
      if (success) {
        setNewFolderName('');
        setIsCreatingRoot(false);
      }
    }
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Files</span>
        <Dialog open={isCreatingRoot} onOpenChange={setIsCreatingRoot}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateRootFolder}>
              <DialogHeader>
                <DialogTitle>Create Root Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for the new root folder.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Folder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-1">
        {files.map((node) => (
          <FileTreeNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedFileId}
            isExpanded={expandedFolders.has(node.id)}
            onToggle={toggleFolder}
            expandedFolders={expandedFolders}
            onSelect={setSelectedFileId}
            onDelete={deleteFile}
            onCreate={createFile}
            onRefresh={fetchFiles}
            selectedFileId={selectedFileId}
          />
        ))}
      </div>
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileWithChildren;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  expandedFolders: Set<string>;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => Promise<boolean>;
  onCreate: (file: any) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  selectedFileId: string | null;
}

function FileTreeNode({
  node,
  isSelected,
  isExpanded,
  onToggle,
  expandedFolders,
  onSelect,
  onDelete,
  onCreate,
  onRefresh,
  selectedFileId,
}: FileTreeNodeProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'file' | 'folder'>('file');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const success = await onCreate({
        name: newName.trim(),
        path: `${node.path}/${newName.trim()}`,
        type: newType,
        parentId: node.id,
        content: newType === 'file' ? '' : null,
      });
      if (success) {
        setNewName('');
        setIsCreating(false);
        onRefresh();
      }
    }
  };

  const handleRename = async () => {
    const success = await updateName(node.id, newName);
    if (success) {
      onRefresh();
      onSelect(null);
    }
  };

  const handleDelete = async () => {
    const success = await onDelete(node.id);
    if (success) {
      onRefresh();
      onSelect(null);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 p-1 rounded hover:bg-gray-100 cursor-pointer text-sm',
          isSelected && 'bg-gray-100'
        )}
      >
        {node.type === 'folder' && (
          <button onClick={() => onToggle(node.id)} className="p-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        <div
          className="flex-1 flex items-center gap-2"
          onClick={() => {
            if (node.type === 'file') {
              onSelect(node.id);
            } else {
              onToggle(node.id);
            }
          }}
        >
          <NodeIcon type={node.type} expanded={isExpanded} />
          <span>{node.name}</span>
        </div>
        <div className="flex items-center">
          {node.type === 'folder' && (
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Create New</DialogTitle>
                    <DialogDescription>
                      Create a new file or folder in {node.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={newType === 'file' ? 'default' : 'outline'}
                        onClick={() => setNewType('file')}
                      >
                        File
                      </Button>
                      <Button
                        type="button"
                        variant={newType === 'folder' ? 'default' : 'outline'}
                        onClick={() => setNewType('folder')}
                      >
                        Folder
                      </Button>
                    </div>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={`${newType === 'file' ? 'File' : 'Folder'} name`}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {node.type === 'file' && (
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleRename}>
                  <DialogHeader>
                    <DialogTitle>Rename {node.name}</DialogTitle>
                    <DialogDescription>
                      Enter a new name for {node.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="New name"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Rename</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to delete this file?')
              ) {
                handleDelete();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {node.type === 'folder' && isExpanded && node.children && (
        <div className="ml-4">
          {node.children.map((childNode) => (
            <FileTreeNode
              key={childNode.id}
              node={childNode}
              isSelected={childNode.id === selectedFileId}
              isExpanded={expandedFolders.has(childNode.id)}
              onToggle={onToggle}
              expandedFolders={expandedFolders}
              onSelect={onSelect}
              onDelete={onDelete}
              onCreate={onCreate}
              onRefresh={onRefresh}
              selectedFileId={selectedFileId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
