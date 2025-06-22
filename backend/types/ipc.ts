import { WorkspaceData, SaveResult } from "./workspace";

// IPC Channel names
export const IPC_CHANNELS = {
  GET_APP_VERSION: "get-app-version",
  OPEN_PROJECT_DIALOG: "open-project-dialog",
  LOAD_WORKSPACE: "load-workspace",
  SAVE_WORKSPACE: "save-workspace",
  WATCH_FILE_CHANGES: "watch-file-changes",
  MINIMIZE_WINDOW: "minimize-window",
  MAXIMIZE_WINDOW: "maximize-window",
  CLOSE_WINDOW: "close-window",
} as const;

// IPC Request/Response types
export interface OpenProjectDialogResponse {
  projectPath: string | null;
  cancelled: boolean;
}

export interface LoadWorkspaceRequest {
  projectPath: string;
}

export interface LoadWorkspaceResponse {
  success: boolean;
  data?: WorkspaceData;
  error?: string;
}

export interface SaveWorkspaceRequest {
  workspaceData: WorkspaceData;
}

export type SaveWorkspaceResponse = SaveResult;

// File watching types
export interface FileChange {
  type: "created" | "modified" | "deleted";
  filePath: string;
  timestamp: Date;
}

export interface FileChangeCallback {
  (changes: FileChange[]): void;
}

// Window operations
export interface WindowOperation {
  action: "minimize" | "maximize" | "close";
}

// Error response format
export interface IPCErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Main process service types
export interface MdcFile {
  filePath: string;
  content: string;
  stats: {
    size: number;
    mtime: Date;
    ctime: Date;
  };
}

export interface ScanResult {
  files: MdcFile[];
  totalFiles: number;
  errors: string[];
}

// Parser configuration
export interface ParserConfig {
  includeHidden: boolean;
  maxFileSize: number; // in bytes
  followLinks: boolean;
}
