"use client";

import { Button } from "@/components/ui/button";
import { LayoutDashboard, Kanban, Calendar, List } from "lucide-react";
import { ViewMode } from "./WorkspaceDashboard";
import { cn } from "@/lib/utils";

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const views = [
    { id: "dashboard" as ViewMode, label: "Dashboard", icon: LayoutDashboard },
    { id: "kanban" as ViewMode, label: "Kanban", icon: Kanban },
    { id: "timeline" as ViewMode, label: "Timeline", icon: Calendar },
    { id: "list" as ViewMode, label: "List", icon: List },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <Button
            key={view.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange(view.id)}
            className={cn(
              "flex items-center gap-2 transition-all",
              isActive
                ? "bg-white dark:bg-gray-600 shadow-sm"
                : "hover:bg-white/50 dark:hover:bg-gray-600/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
