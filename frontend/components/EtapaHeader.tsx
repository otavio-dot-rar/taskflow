"use client";

import { Etapa } from "../types/workspace";
import { Badge } from "./ui/badge";

interface EtapaHeaderProps {
  etapa: Etapa;
}

export function EtapaHeader({ etapa }: EtapaHeaderProps) {
  const totalTasks = etapa.tasks.length;
  const completedTasks = etapa.tasks.filter((task) => task.completed).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-md">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {etapa.title}
      </h4>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {completedTasks}/{totalTasks}
        </span>
        <Badge
          variant={progressPercentage === 100 ? "default" : "secondary"}
          className="text-xs"
        >
          {progressPercentage}%
        </Badge>
      </div>
    </div>
  );
}
