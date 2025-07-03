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

      {/* Two Column Layout: Phases + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Project Phases */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Project Phases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phaseStats.map((phase) => (
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

        {/* Right Column: Tasks - Sticky with full height */}
        <div className="sticky top-6 h-[calc(100vh-3rem)]">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedPhase ? `Tasks - ${selectedPhase}` : "All Tasks"}
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
            <CardContent className="flex-1 overflow-hidden">
              {!selectedPhase ? (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Select a Phase</p>
                    <p className="text-sm">Click on a phase to see its tasks</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2 space-y-4">
                  {/* Phase Tasks by Etapa */}
                  {allPhases
                    .filter((phase) => phase.title === selectedPhase)
                    .map((phase) =>
                      phase.etapas.map((etapa) => (
                        <div key={etapa.id} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-950 z-10">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {etapa.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {etapa.tasks.length} tasks
                            </Badge>
                          </div>
                          <div className="space-y-2 pb-4">
                            {etapa.tasks.map((task, taskIndex) => (
                              <div
                                key={`${task.id}-${taskIndex}`}
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                ) : (
                                  <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span
                                  className={cn(
                                    "text-sm flex-1",
                                    task.completed
                                      ? "line-through text-gray-500 dark:text-gray-400"
                                      : "text-gray-900 dark:text-gray-100"
                                  )}
                                >
                                  {task.title}
                                </span>
                                {task.completed ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                    ✅ Done
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                    📋 Todo
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {etapa.tasks.length === 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No tasks in this section
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
