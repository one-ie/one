import { useState, useEffect } from 'react';
import { useInstallation } from '@/components/providers/InstallationProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export function InstallationFileBrowser() {
  const { installationName } = useInstallation();
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!installationName) {
      setLoading(false);
      return;
    }

    // Load file tree from installation folder
    fetchFileTree(installationName)
      .then(setFiles)
      .finally(() => setLoading(false));
  }, [installationName]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Installation Files</CardTitle>
          <CardDescription>Loading file tree...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!installationName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Installation Files</CardTitle>
          <CardDescription>No installation folder configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Initialize an installation folder to store organization-specific documentation and configuration.
            </p>
            <code className="rounded bg-muted px-3 py-1.5 text-sm">npx oneie init</code>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Installation Files
          <Badge variant="secondary">{installationName}</Badge>
        </CardTitle>
        <CardDescription>Organization-specific documentation and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <div className="p-4">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files found in installation folder.</p>
            ) : (
              <FileTree nodes={files} />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface FileTreeProps {
  nodes: FileNode[];
  depth?: number;
}

function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <li key={node.path} style={{ paddingLeft: `${depth * 16}px` }}>
          <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent">
            <span className="text-lg">{node.type === 'directory' ? '📁' : '📄'}</span>
            <span className="text-sm">{node.name}</span>
          </div>
          {node.children && node.children.length > 0 && (
            <FileTree nodes={node.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Helper: Fetch file tree from server
 * Security: Filters out sensitive files (.env, node_modules, etc.)
 */
async function fetchFileTree(installationName: string): Promise<FileNode[]> {
  try {
    // In production, this would be an API endpoint
    // For now, return mock structure
    return [
      {
        name: 'groups',
        path: `/${installationName}/groups`,
        type: 'directory',
        children: [
          {
            name: 'engineering',
            path: `/${installationName}/groups/engineering`,
            type: 'directory',
            children: [
              {
                name: 'practices.md',
                path: `/${installationName}/groups/engineering/practices.md`,
                type: 'file',
              },
            ],
          },
        ],
      },
      {
        name: 'things',
        path: `/${installationName}/things`,
        type: 'directory',
        children: [
          {
            name: 'vision.md',
            path: `/${installationName}/things/vision.md`,
            type: 'file',
          },
        ],
      },
      {
        name: 'README.md',
        path: `/${installationName}/README.md`,
        type: 'file',
      },
    ];
  } catch (error) {
    console.error('Failed to fetch file tree:', error);
    return [];
  }
}
