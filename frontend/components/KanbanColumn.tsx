"use client";

import { Phase } from "../types/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { TaskCard } from "./TaskCard";
import { EtapaHeader } from "./EtapaHeader";

interface KanbanColumnProps {
  phase: Phase & { fileName: string; filePath: string };
  fileName: string;
}

export function KanbanColumn({ phase, fileName }: KanbanColumnProps) {
  const totalTasks = phase.etapas.reduce(
    (acc, etapa) => acc + etapa.tasks.length,
    0
  );
  const completedTasks = phase.etapas.reduce(
    (acc, etapa) => acc + etapa.tasks.filter((task) => task.completed).length,
    0
  );
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">{phase.title}</CardTitle>
            <Badge
              variant={progressPercentage === 100 ? "default" : "secondary"}
            >
              {progressPercentage}%
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{fileName}</span>
            <span>
              {completedTasks}/{totalTasks} tarefas
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {phase.etapas.map((etapa) => (
            <div key={etapa.id} className="space-y-2">
              <EtapaHeader etapa={etapa} />

              <div className="space-y-2 pl-2">
                {etapa.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    phaseId={phase.id}
                    etapaId={etapa.id}
                  />
                ))}

                {etapa.tasks.length === 0 && (
                  <div className="text-xs text-muted-foreground italic pl-4">
                    Nenhuma tarefa nesta etapa
                  </div>
                )}
              </div>
            </div>
          ))}

          {phase.etapas.length === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">Nenhuma etapa encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
