"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  List,
  FolderOpen,
  BarChart3,
} from "lucide-react";
import { WorkspaceData } from "../types/workspace";
import { ViewMode } from "./WorkspaceDashboard";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspace: WorkspaceData;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onChangeProject: () => void;
}

export function Sidebar({
  workspace,
  currentView,
  onViewChange,
  onChangeProject,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard" as ViewMode,
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Project overview",
    },
    {
      id: "kanban" as ViewMode,
      label: "Kanban",
      icon: Kanban,
      description: "Board view",
    },
    {
      id: "timeline" as ViewMode,
      label: "Timeline",
      icon: Calendar,
      description: "Roadmap view",
    },
    {
      id: "list" as ViewMode,
      label: "List",
      icon: List,
      description: "Table view",
    },
  ];

  // Calculate stats
  const totalPhases = workspace.files.reduce(
    (acc, file) => acc + file.content.phases.length,
    0
  );
  const totalTasks = workspace.files.reduce(
    (acc, file) =>
      acc +
      file.content.phases.reduce(
        (phaseAcc, phase) =>
          phaseAcc +
          phase.etapas.reduce(
            (etapaAcc, etapa) => etapaAcc + etapa.tasks.length,
            0
          ),
        0
      ),
    0
  );
  const completedTasks = workspace.files.reduce(
    (acc, file) =>
      acc +
      file.content.phases.reduce(
        (phaseAcc, phase) =>
          phaseAcc +
          phase.etapas.reduce(
            (etapaAcc, etapa) =>
              etapaAcc + etapa.tasks.filter((task) => task.completed).length,
            0
          ),
        0
      ),
    0
  );
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Cursor TaskFlow
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Project Management
        </p>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Project Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Current Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Path:
              </p>
              <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {workspace.projectPath.split("\\").pop() ||
                  workspace.projectPath.split("/").pop()}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Files:
              </p>
              <Badge variant="secondary">
                {workspace.files.length} arquivo(s)
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onChangeProject}
              className="w-full"
            >
              Change Project
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {totalPhases}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Phases
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {totalTasks}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Tasks
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
