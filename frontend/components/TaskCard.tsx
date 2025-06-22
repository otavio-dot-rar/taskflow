"use client";

import { TaskItem } from "../types/workspace";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface TaskCardProps {
  task: TaskItem;
  phaseId?: string; // Will be used in Phase 2 for drag & drop
  etapaId?: string; // Will be used in Phase 2 for drag & drop
}

export function TaskCard({ task }: TaskCardProps) {
  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        task.completed
          ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            className="mt-0.5"
            // Note: onChange will be implemented in Phase 2 (interactive)
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <p
                className={`text-sm ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {task.title}
              </p>

              {hasSubtasks && (
                <Badge variant="outline" className="text-xs ml-2">
                  {completedSubtasks}/{totalSubtasks}
                </Badge>
              )}
            </div>

            {/* Subtasks */}
            {hasSubtasks && (
              <div className="space-y-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      className="scale-75"
                      // Note: onChange will be implemented in Phase 2
                    />
                    <span
                      className={`text-xs ${
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task completion status indicator */}
        {task.completed && (
          <div className="mt-2 flex items-center justify-end">
            <Badge variant="default" className="text-xs">
              Concluída
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
