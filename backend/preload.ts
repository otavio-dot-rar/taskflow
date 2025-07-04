import { contextBridge, ipcRenderer } from "electron";

// IPC Channel names (hardcoded to avoid import issues in preload)
const IPC_CHANNELS = {
  GET_APP_VERSION: "get-app-version",
  OPEN_PROJECT_DIALOG: "open-project-dialog",
  LOAD_WORKSPACE: "load-workspace",
  SAVE_WORKSPACE: "save-workspace",
  CREATE_FILE: "create-file",
  DELETE_FILE: "delete-file",
  BACKUP_FILE: "backup-file",
  RESTORE_BACKUP: "restore-backup",
  LIST_BACKUPS: "list-backups",
} as const;

// Define the API that will be exposed to the renderer process
export interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;

  // Project operations
  openProjectDialog: () => Promise<string | null>;
  loadWorkspace: (projectPath: string) => Promise<{
    success: boolean;
    data?: object;
    error?: string;
  }>;

  // File editing operations
  saveWorkspace: (workspaceData: any) => Promise<{
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
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  // Project operations
  openProjectDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_PROJECT_DIALOG),
  loadWorkspace: (projectPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_WORKSPACE, projectPath),

  // File editing operations
  saveWorkspace: (workspaceData: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_WORKSPACE, { workspaceData }),

  createFile: (filePath: string, options = {}) =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_FILE, {
      filePath,
      content: options.content,
      template: options.template,
    }),

  deleteFile: (filePath: string, options = {}) =>
    ipcRenderer.invoke(IPC_CHANNELS.DELETE_FILE, {
      filePath,
      createBackup: options.createBackup,
    }),

  // Backup operations
  backupFile: (filePath: string, maxBackups?: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.BACKUP_FILE, { filePath, maxBackups }),

  restoreBackup: (originalPath: string, backupPath?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.RESTORE_BACKUP, { originalPath, backupPath }),

  listBackups: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LIST_BACKUPS, { filePath }),
};

// Use contextBridge to securely expose the API
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Debug log to confirm preload is running
console.log("[Preload] ElectronAPI exposed to window:", electronAPI);

// Type declaration for TypeScript (will be used in renderer)
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
