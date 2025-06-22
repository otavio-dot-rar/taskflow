"use client";

import { WorkspaceData } from "../types/workspace";
import { KanbanColumn } from "./KanbanColumn";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface KanbanBoardProps {
  workspace: WorkspaceData;
}

export function KanbanBoard({ workspace }: KanbanBoardProps) {
  // Collect all phases from all files
  const allPhases = workspace.files.flatMap((file) =>
    file.content.phases.map((phase) => ({
      ...phase,
      fileName: file.fileName,
      filePath: file.filePath,
    }))
  );

  if (allPhases.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nenhuma Fase Encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Os arquivos .mdc não contêm estrutura de fases identificável.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Kanban - {workspace.files.length} arquivo(s)
        </h2>
        <p className="text-sm text-muted-foreground">
          Visualização das fases e tarefas dos arquivos .mdc
        </p>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {allPhases.map((phase) => (
          <KanbanColumn
            key={`${phase.fileName}-${phase.id}`}
            phase={phase}
            fileName={phase.fileName}
          />
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {allPhases.length}
            </div>
            <p className="text-sm text-muted-foreground">Total de Fases</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {allPhases.reduce(
                (acc, phase) =>
                  acc +
                  phase.etapas.reduce(
                    (etapaAcc, etapa) => etapaAcc + etapa.tasks.length,
                    0
                  ),
                0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total de Tarefas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {allPhases.reduce(
                (acc, phase) =>
                  acc +
                  phase.etapas.reduce(
                    (etapaAcc, etapa) =>
                      etapaAcc +
                      etapa.tasks.filter((task) => task.completed).length,
                    0
                  ),
                0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
