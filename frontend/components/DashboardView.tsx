"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Target,
  FileText,
  TrendingUp,
} from "lucide-react";
import { WorkspaceData } from "../types/workspace";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
  workspace: WorkspaceData;
}

export function DashboardView({ workspace }: DashboardViewProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  // Calculate overall stats
  const allPhases = workspace.files.flatMap((file) =>
    file.content.phases.map((phase) => ({
      ...phase,
      fileName: file.fileName,
      filePath: file.filePath,
    }))
  );

  const allTasks = allPhases.flatMap((phase) =>
    phase.etapas.flatMap((etapa) =>
      etapa.tasks.map((task) => ({
        ...task,
        phaseName: phase.title,
        fileName: phase.fileName,
        etapaName: etapa.title,
      }))
    )
  );

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.completed).length;
  const inProgressTasks = allTasks.filter((task) => !task.completed).length;
  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Phase-wise progress
  const phaseStats = allPhases.map((phase) => {
    const phaseTasks = phase.etapas.flatMap((etapa) => etapa.tasks);
    const phaseCompleted = phaseTasks.filter((task) => task.completed).length;
    const phaseTotal = phaseTasks.length;
    const phaseProgress =
      phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

    return {
      ...phase,
      totalTasks: phaseTotal,
      completedTasks: phaseCompleted,
      progress: phaseProgress,
      status:
        phaseProgress === 100
          ? "completed"
          : phaseProgress > 0
          ? "in-progress"
          : "not-started",
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            ✅ Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            🔄 In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            📋 To Do
          </Badge>
        );
    }
  };

  const filteredTasks = selectedPhase
    ? allTasks.filter((task) => task.phaseName === selectedPhase)
    : allTasks;

  return (
    <div className="p-6 space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            {/* Custom progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {allPhases.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Phases
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {inProgressTasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {phaseStats.map((phase, index) => (
              <div
                key={`${phase.fileName}-${phase.id}`}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedPhase === phase.title
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() =>
                  setSelectedPhase(
                    selectedPhase === phase.title ? null : phase.title
                  )
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phase {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {phase.title}
                    </h3>
                  </div>
                  {getStatusBadge(phase.status)}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {phase.completedTasks}/{phase.totalTasks} tasks completed
                  </div>
                  <div className="text-sm font-medium">{phase.progress}%</div>
                </div>

                {/* Custom progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  From: {phase.fileName}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tasks {selectedPhase && `- ${selectedPhase}`}
            </CardTitle>
            {selectedPhase && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPhase(null)}
              >
                Show All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Task
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Phase
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Etapa
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <tr
                    key={`${task.id}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-400" />
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            task.completed
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-gray-900 dark:text-gray-100"
                          )}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.phaseName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.etapaName}
                    </td>
                    <td className="py-3 px-4">
                      {task.completed ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          ✅ Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          🔄 In Progress
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {task.fileName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
