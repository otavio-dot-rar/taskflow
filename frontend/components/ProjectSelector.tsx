"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderIcon, AlertCircleIcon } from "lucide-react";
import { WorkspaceData } from "../types/workspace";
import { KanbanBoard } from "./KanbanBoard";

export function ProjectSelector() {
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectProject = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Check if electronAPI exists
      console.log("window.electronAPI:", window.electronAPI);
      console.log(
        "openProjectDialog method:",
        window.electronAPI?.openProjectDialog
      );

      // Open project selection dialog
      const projectPath = await window.electronAPI.openProjectDialog();

      if (!projectPath) {
        setLoading(false);
        return; // User cancelled
      }

      // Load workspace from selected path
      const result = await window.electronAPI.loadWorkspace(projectPath);

      if (!result.success) {
        throw new Error(result.error || "Failed to load workspace");
      }

      setWorkspace(result.data || null);
      console.log("Workspace loaded:", result.data);
    } catch (err) {
      console.error("Error loading project:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (workspace) {
    return (
      <div className="w-full space-y-6">
        {/* Header with project info */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderIcon className="h-5 w-5" />
                  {workspace.projectPath}
                </CardTitle>
                <CardDescription>
                  {workspace.files.length} arquivo(s) • Carregado em{" "}
                  {new Date(workspace.loadedAt).toLocaleString()}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={() => setWorkspace(null)}>
                Trocar Projeto
              </Button>
            </div>
          </CardHeader>

          {workspace.scanErrors && workspace.scanErrors.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-700 flex items-center gap-2">
                  <AlertCircleIcon className="h-4 w-4" />
                  Avisos de Scan:
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {workspace.scanErrors.map((error, index) => (
                    <div
                      key={index}
                      className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Kanban Board */}
        <KanbanBoard workspace={workspace} />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderIcon className="h-5 w-5" />
          Selecionar Projeto
        </CardTitle>
        <CardDescription>
          Escolha uma pasta que contenha arquivos .mdc para visualizar no Kanban
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4" />
            {error}
          </div>
        )}
        <Button
          onClick={handleSelectProject}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Carregando..." : "Selecionar Pasta"}
        </Button>
      </CardContent>
    </Card>
  );
}
