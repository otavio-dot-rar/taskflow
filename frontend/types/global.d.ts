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

      // File editing operations
      saveWorkspace: (workspaceData: WorkspaceData) => Promise<{
        success: boolean;
        results?: Array<{
          filePath: string;
          success: boolean;
          savedAt: string;
          error?: string;
        }>;
        error?: string;
        message: string;
      }>;

      createFile: (filePath: string, options?: {
        content?: string;
        template?: "task" | "documentation" | "reference";
      }) => Promise<{
        success: boolean;
        filePath?: string;
        error?: string;
      }>;

      deleteFile: (filePath: string, options?: {
        createBackup?: boolean;
      }) => Promise<{
        success: boolean;
        backupPath?: string;
        error?: string;
      }>;

      // Backup operations
      backupFile: (filePath: string, maxBackups?: number) => Promise<{
        success: boolean;
        backupPath?: string;
        error?: string;
      }>;

      restoreBackup: (originalPath: string, backupPath?: string) => Promise<{
        success: boolean;
        error?: string;
      }>;

      listBackups: (filePath: string) => Promise<{
        success: boolean;
        backups?: Array<{
          path: string;
          timestamp: Date;
          size: number;
        }>;
        error?: string;
      }>;
    };
  }
}

export {};
