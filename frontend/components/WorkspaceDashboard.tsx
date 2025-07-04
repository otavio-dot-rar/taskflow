"use client";

import { useState } from "react";
import { WorkspaceData } from "../types/workspace";
import { Sidebar } from "./Sidebar";
import { DashboardView } from "./DashboardView";
import { KanbanBoard } from "./KanbanBoard";
import { ViewSwitcher } from "./ViewSwitcher";
import { SaveButton, useSaveStatus } from "./SaveButton";

export type ViewMode = "dashboard" | "kanban" | "timeline" | "list";

interface WorkspaceDashboardProps {
  workspace: WorkspaceData;
  onChangeProject: () => void;
}

export function WorkspaceDashboard({
  workspace,
  onChangeProject,
}: WorkspaceDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const { hasUnsavedChanges } = useSaveStatus(workspace);

  const renderCurrentView = () => {
    switch (currentView) {
      case "kanban":
        return <KanbanBoard workspace={workspace} />;
      case "dashboard":
        return <DashboardView workspace={workspace} />;
      case "timeline":
        return (
          <div className="p-8 text-center text-muted-foreground">
            Timeline view - Em breve
          </div>
        );
      case "list":
        return (
          <div className="p-8 text-center text-muted-foreground">
            List view - Em breve
          </div>
        );
      default:
        return <DashboardView workspace={workspace} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        workspace={workspace}
        currentView={currentView}
        onViewChange={setCurrentView}
        onChangeProject={onChangeProject}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {currentView === "dashboard" && "Project Overview"}
                {currentView === "kanban" && "Kanban Board"}
                {currentView === "timeline" && "Timeline"}
                {currentView === "list" && "Task List"}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track the progress of your projects and tasks
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SaveButton
                workspace={workspace}
                hasUnsavedChanges={hasUnsavedChanges}
                onSaveComplete={(success) => {
                  if (success) {
                    // Mark files as saved by updating their hasChanges flag
                    workspace.files.forEach(file => {
                      if (file.hasChanges) {
                        file.hasChanges = false;
                      }
                    });
                  }
                }}
              />
              
              <ViewSwitcher
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">{renderCurrentView()}</div>
      </div>
    </div>
  );
}
