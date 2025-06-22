import { contextBridge, ipcRenderer } from "electron";

// IPC Channel names (hardcoded to avoid import issues in preload)
const IPC_CHANNELS = {
  GET_APP_VERSION: "get-app-version",
  OPEN_PROJECT_DIALOG: "open-project-dialog",
  LOAD_WORKSPACE: "load-workspace",
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
}

// Expose the API to the renderer process
const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  // Project operations
  openProjectDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_PROJECT_DIALOG),
  loadWorkspace: (projectPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.LOAD_WORKSPACE, projectPath),
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
