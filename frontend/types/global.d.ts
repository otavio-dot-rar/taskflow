import { WorkspaceData } from "../../types/workspace";

declare global {
  interface Window {
    electronAPI: {
      // App info
      getAppVersion: () => Promise<string>;

      // Project operations
      openProjectDialog: () => Promise<string | null>;
      loadWorkspace: (projectPath: string) => Promise<{
        success: boolean;
        data?: WorkspaceData;
        error?: string;
      }>;
    };
  }
}

export {};
