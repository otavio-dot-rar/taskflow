import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs/promises";
import { MdcParser } from "./services/mdc-parser";
import { MdcSerializer } from "./services/mdc-serializer";
import { BackupManager } from "./services/backup-manager";
import { existsSync } from "fs";
import {
  IPC_CHANNELS,
  LoadWorkspaceResponse,
  ScanResult,
  MdcFile,
  SaveWorkspaceRequest,
  SaveWorkspaceResponse,
  CreateFileRequest,
  CreateFileResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  BackupFileRequest,
  BackupFileResponse,
  RestoreBackupRequest,
  RestoreBackupResponse,
  ListBackupsRequest,
  ListBackupsResponse,
} from "./types/ipc";
import { WorkspaceData, FileSaveResult } from "./types/workspace";

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === "development";

function createWindow(): void {
  // Create the browser window
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("[Main] Preload path:", preloadPath);
  console.log("[Main] Preload exists:", existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true, // Security best practice
      preload: preloadPath, // Preload script for IPC
    },
    titleBarStyle: "default",
    show: false, // Don't show until ready
  });

  // Load the Next.js app
  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "frontend/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();

      // Open DevTools in development
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Prevent opening new windows
    console.log("Blocked attempt to open:", url);
    return { action: "deny" };
  });
});

// Utility function to scan for .mdc files
async function scanMdcFiles(directoryPath: string): Promise<ScanResult> {
  const files: MdcFile[] = [];
  const errors: string[] = [];

  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      if (entry.isFile() && entry.name.endsWith(".mdc")) {
        try {
          const content = await fs.readFile(fullPath, "utf-8");
          const stats = await fs.stat(fullPath);

          files.push({
            filePath: fullPath,
            content,
            stats: {
              size: stats.size,
              mtime: stats.mtime,
              ctime: stats.ctime,
            },
          });
        } catch (error) {
          errors.push(
            `Failed to read ${fullPath}: ${(error as Error).message}`
          );
        }
      } else if (entry.isDirectory() && !entry.name.startsWith(".")) {
        // Recursively scan subdirectories (excluding hidden ones)
        try {
          const subResult = await scanMdcFiles(fullPath);
          files.push(...subResult.files);
          errors.push(...subResult.errors);
        } catch (error) {
          errors.push(
            `Failed to scan directory ${fullPath}: ${(error as Error).message}`
          );
        }
      }
    }
  } catch (error) {
    errors.push(
      `Failed to scan directory ${directoryPath}: ${(error as Error).message}`
    );
  }

  return {
    files,
    totalFiles: files.length,
    errors,
  };
}

// IPC Handlers
ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
  return app.getVersion();
});

ipcMain.handle(IPC_CHANNELS.OPEN_PROJECT_DIALOG, async () => {
  try {
    if (!mainWindow) {
      throw new Error("No main window available");
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      title: "Selecionar Pasta do Projeto",
      properties: ["openDirectory"],
      message: "Escolha a pasta que contém os arquivos .mdc",
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error("Error opening project dialog:", error);
    throw new Error(
      `Falha ao abrir diálogo de seleção: ${(error as Error).message}`
    );
  }
});

ipcMain.handle(
  IPC_CHANNELS.LOAD_WORKSPACE,
  async (event, projectPath: string): Promise<LoadWorkspaceResponse> => {
    try {
      console.log("Loading workspace from:", projectPath);

      // Verify directory exists
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error("Path is not a directory");
      }

      // Scan for .mdc files
      const scanResult = await scanMdcFiles(projectPath);

      if (scanResult.files.length === 0) {
        return {
          success: false,
          error: "No .mdc files found in the selected directory",
        };
      }

      // Log any scan errors but don't fail the operation
      if (scanResult.errors.length > 0) {
        console.warn("Scan warnings:", scanResult.errors);
      }

      // Parse all .mdc files using the MdcParser
      const filePaths = scanResult.files.map((f) => f.filePath);
      const parsedFiles = await MdcParser.parseFiles(filePaths);

      const workspaceData = {
        projectPath,
        files: parsedFiles,
        loadedAt: new Date().toISOString(),
        scanErrors: scanResult.errors,
      };

      console.log(`Loaded ${scanResult.files.length} .mdc files`);

      return {
        success: true,
        data: workspaceData,
      };
    } catch (error) {
      console.error("Error loading workspace:", error);
      return {
        success: false,
        error: `Falha ao carregar workspace: ${(error as Error).message}`,
      };
    }
  }
);

// Save workspace handler
ipcMain.handle(
  IPC_CHANNELS.SAVE_WORKSPACE,
  async (event, request: SaveWorkspaceRequest): Promise<SaveWorkspaceResponse> => {
    try {
      console.log("Saving workspace...");
      const { workspaceData } = request;

      // Get only files that have changes
      const filesToSave = workspaceData.files.filter(file => file.hasChanges);
      
      if (filesToSave.length === 0) {
        return {
          success: true,
          results: [],
          message: "No changes to save",
        };
      }

      console.log(`Saving ${filesToSave.length} modified files...`);

      // Create backups first
      const backupResults = await BackupManager.createBackups(filesToSave);
      console.log(`Created ${backupResults.filter(r => r.success).length} backups`);

      // Serialize and save files
      const saveResults: FileSaveResult[] = [];
      
      for (const file of filesToSave) {
        try {
          // Serialize the file
          const serializedContent = MdcSerializer.serialize(file);
          
          // Validate the serialized content
          const validation = MdcSerializer.validate(serializedContent);
          if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
          }

          // Write to disk
          await fs.writeFile(file.filePath, serializedContent, 'utf-8');

          saveResults.push({
            filePath: file.filePath,
            success: true,
            savedAt: new Date().toISOString(),
          });

          console.log(`Saved: ${file.fileName}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Failed to save ${file.fileName}:`, error);
          
          saveResults.push({
            filePath: file.filePath,
            success: false,
            savedAt: new Date().toISOString(),
            error: errorMessage,
          });
        }
      }

      const successCount = saveResults.filter(r => r.success).length;
      const failureCount = saveResults.length - successCount;

      if (failureCount === 0) {
        return {
          success: true,
          results: saveResults,
          message: `Successfully saved ${successCount} file(s)`,
        };
      } else {
        return {
          success: false,
          results: saveResults,
          error: `Failed to save ${failureCount} file(s), ${successCount} saved successfully`,
          message: "Partial save completed with errors",
        };
      }
    } catch (error) {
      console.error("Error saving workspace:", error);
      return {
        success: false,
        error: `Failed to save workspace: ${(error as Error).message}`,
        message: "Save operation failed",
      };
    }
  }
);

// Create new file handler
ipcMain.handle(
  IPC_CHANNELS.CREATE_FILE,
  async (event, request: CreateFileRequest): Promise<CreateFileResponse> => {
    try {
      const { filePath, content, template } = request;

      // Check if file already exists
      try {
        await fs.access(filePath);
        return {
          success: false,
          error: "File already exists",
        };
      } catch {
        // File doesn't exist, which is what we want
      }

      // Generate content based on template or use provided content
      let fileContent = content;
      if (!fileContent && template) {
        fileContent = MdcSerializer.generateTemplate({
          title: path.basename(filePath, ".mdc"),
          type: template,
          alwaysApply: template === "documentation",
          description: template === "task" ? "New task file" : "",
        });
      }

      if (!fileContent) {
        fileContent = MdcSerializer.generateTemplate({
          title: path.basename(filePath, ".mdc"),
        });
      }

      // Ensure directory exists
      const directory = path.dirname(filePath);
      await fs.mkdir(directory, { recursive: true });

      // Write file
      await fs.writeFile(filePath, fileContent, 'utf-8');

      console.log(`Created new file: ${filePath}`);

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error("Error creating file:", error);
      return {
        success: false,
        error: `Failed to create file: ${(error as Error).message}`,
      };
    }
  }
);

// Delete file handler
ipcMain.handle(
  IPC_CHANNELS.DELETE_FILE,
  async (event, request: DeleteFileRequest): Promise<DeleteFileResponse> => {
    try {
      const { filePath, createBackup = true } = request;

      let backupPath: string | undefined;

      // Create backup if requested
      if (createBackup) {
        const backupResult = await BackupManager.createBackup(filePath);
        if (backupResult.success) {
          backupPath = backupResult.backupPath;
        }
      }

      // Delete the file
      await fs.unlink(filePath);

      console.log(`Deleted file: ${filePath}`);

      return {
        success: true,
        backupPath,
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error: `Failed to delete file: ${(error as Error).message}`,
      };
    }
  }
);

// Backup file handler
ipcMain.handle(
  IPC_CHANNELS.BACKUP_FILE,
  async (event, request: BackupFileRequest): Promise<BackupFileResponse> => {
    try {
      const { filePath, maxBackups } = request;

      const backupResult = await BackupManager.createBackup(filePath, { maxBackups });

      if (backupResult.success) {
        return {
          success: true,
          backupPath: backupResult.backupPath,
        };
      } else {
        return {
          success: false,
          error: backupResult.error || "Backup failed",
        };
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      return {
        success: false,
        error: `Failed to create backup: ${(error as Error).message}`,
      };
    }
  }
);

// Restore backup handler
ipcMain.handle(
  IPC_CHANNELS.RESTORE_BACKUP,
  async (event, request: RestoreBackupRequest): Promise<RestoreBackupResponse> => {
    try {
      const { originalPath, backupPath } = request;

      const restoreResult = await BackupManager.restoreFromBackup(originalPath, backupPath);

      return restoreResult;
    } catch (error) {
      console.error("Error restoring backup:", error);
      return {
        success: false,
        error: `Failed to restore backup: ${(error as Error).message}`,
      };
    }
  }
);

// List backups handler
ipcMain.handle(
  IPC_CHANNELS.LIST_BACKUPS,
  async (event, request: ListBackupsRequest): Promise<ListBackupsResponse> => {
    try {
      const { filePath } = request;

      const backups = await BackupManager.listBackups(filePath);

      return {
        success: true,
        backups,
      };
    } catch (error) {
      console.error("Error listing backups:", error);
      return {
        success: false,
        error: `Failed to list backups: ${(error as Error).message}`,
      };
    }
  }
);
