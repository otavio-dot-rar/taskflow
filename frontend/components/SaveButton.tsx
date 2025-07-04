"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon, CheckIcon, AlertCircleIcon, LoaderIcon } from "lucide-react";
import { WorkspaceData } from "../types/workspace";
// Temporary simple toast replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`Erro: ${title}\n${description}`);
    } else {
      alert(`${title}\n${description}`);
    }
  }
});

interface SaveButtonProps {
  workspace: WorkspaceData | null;
  hasUnsavedChanges: boolean;
  onSaveComplete?: (success: boolean) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

export function SaveButton({
  workspace,
  hasUnsavedChanges,
  onSaveComplete,
  variant = "default",
  size = "default",
  showLabel = true,
}: SaveButtonProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!workspace || !hasUnsavedChanges || saving) {
      return;
    }

    try {
      setSaving(true);

      // Call the save API
      const result = await window.electronAPI.saveWorkspace(workspace);

      if (result.success) {
        setLastSaved(new Date());
        
        toast({
          title: "Projeto salvo",
          description: result.message || `${result.results?.length || 0} arquivo(s) salvo(s)`,
        });

        onSaveComplete?.(true);
      } else {
        throw new Error(result.error || "Falha ao salvar o projeto");
      }
    } catch (error) {
      console.error("Error saving workspace:", error);
      
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });

      onSaveComplete?.(false);
    } finally {
      setSaving(false);
    }
  };

  // Handle keyboard shortcut (Ctrl+S)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const getButtonIcon = () => {
    if (saving) {
      return <LoaderIcon className="h-4 w-4 animate-spin" />;
    }
    
    if (!hasUnsavedChanges && lastSaved) {
      return <CheckIcon className="h-4 w-4" />;
    }
    
    if (hasUnsavedChanges) {
      return <AlertCircleIcon className="h-4 w-4" />;
    }
    
    return <SaveIcon className="h-4 w-4" />;
  };

  const getButtonLabel = () => {
    if (saving) {
      return "Salvando...";
    }
    
    if (!hasUnsavedChanges) {
      return lastSaved ? "Salvo" : "Sem alterações";
    }
    
    return "Salvar";
  };

  const getButtonVariant = () => {
    if (hasUnsavedChanges) {
      return "default";
    }
    
    return variant;
  };

  if (!workspace) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSave}
        onKeyDown={handleKeyDown}
        disabled={!hasUnsavedChanges || saving}
        variant={getButtonVariant()}
        size={size}
        className="flex items-center gap-2"
      >
        {getButtonIcon()}
        {showLabel && getButtonLabel()}
      </Button>
      
      {lastSaved && !hasUnsavedChanges && (
        <span className="text-xs text-muted-foreground">
          Salvo em {lastSaved.toLocaleTimeString()}
        </span>
      )}
      
      {hasUnsavedChanges && (
        <span className="text-xs text-orange-600 dark:text-orange-400">
          Alterações não salvas
        </span>
      )}
    </div>
  );
}

// Hook para facilitar o uso do SaveButton
export function useSaveStatus(workspace: WorkspaceData | null) {
  const hasUnsavedChanges = workspace?.files.some(file => file.hasChanges) ?? false;
  
  return {
    hasUnsavedChanges,
    unsavedCount: workspace?.files.filter(file => file.hasChanges).length ?? 0,
  };
}