import { WorkspaceData, SaveResult } from "./workspace";

// IPC Channel names
export const IPC_CHANNELS = {
  GET_APP_VERSION: "get-app-version",
  OPEN_PROJECT_DIALOG: "open-project-dialog",
  LOAD_WORKSPACE: "load-workspace",
  SAVE_WORKSPACE: "save-workspace",
  CREATE_FILE: "create-file",
  DELETE_FILE: "delete-file",
  RENAME_FILE: "rename-file",
  MOVE_FILE: "move-file",
  BACKUP_FILE: "backup-file",
  RESTORE_BACKUP: "restore-backup",
  LIST_BACKUPS: "list-backups",
  VALIDATE_METADATA: "validate-metadata",
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

// File operations types
export interface CreateFileRequest {
  filePath: string;
  content?: string;
  template?: "task" | "documentation" | "reference";
}

export interface CreateFileResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

export interface DeleteFileRequest {
  filePath: string;
  createBackup?: boolean;
}

export interface DeleteFileResponse {
  success: boolean;
  backupPath?: string;
  error?: string;
}

export interface RenameFileRequest {
  oldPath: string;
  newPath: string;
}

export interface RenameFileResponse {
  success: boolean;
  newPath?: string;
  error?: string;
}

export interface MoveFileRequest {
  sourcePath: string;
  destinationPath: string;
}

export interface MoveFileResponse {
  success: boolean;
  newPath?: string;
  error?: string;
}

export interface BackupFileRequest {
  filePath: string;
  maxBackups?: number;
}

export interface BackupFileResponse {
  success: boolean;
  backupPath?: string;
  error?: string;
}

export interface RestoreBackupRequest {
  originalPath: string;
  backupPath?: string;
}

export interface RestoreBackupResponse {
  success: boolean;
  error?: string;
}

export interface ListBackupsRequest {
  filePath: string;
}

export interface ListBackupsResponse {
  success: boolean;
  backups?: Array<{
    path: string;
    timestamp: Date;
    size: number;
  }>;
  error?: string;
}

export interface ValidateMetadataRequest {
  metadata: Record<string, any>;
}

export interface ValidateMetadataResponse {
  valid: boolean;
  errors: string[];
}
