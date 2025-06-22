import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs/promises";
import { MdcParser } from "./services/mdc-parser";
import { existsSync } from "fs";
import {
  IPC_CHANNELS,
  LoadWorkspaceResponse,
  ScanResult,
  MdcFile,
} from "./types/ipc";

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
