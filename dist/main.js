"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const mdc_parser_1 = require("./services/mdc-parser");
const fs_1 = require("fs");
const ipc_1 = require("./types/ipc");
// Keep a global reference of the window object
let mainWindow = null;
const isDev = process.env.NODE_ENV === "development";
function createWindow() {
    // Create the browser window
    const preloadPath = path.join(__dirname, "preload.js");
    console.log("[Main] Preload path:", preloadPath);
    console.log("[Main] Preload exists:", (0, fs_1.existsSync)(preloadPath));
    mainWindow = new electron_1.BrowserWindow({
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
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        // On macOS, re-create window when dock icon is clicked
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// Security: Prevent new window creation
electron_1.app.on("web-contents-created", (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        // Prevent opening new windows
        console.log("Blocked attempt to open:", url);
        return { action: "deny" };
    });
});
// Utility function to scan for .mdc files
async function scanMdcFiles(directoryPath) {
    const files = [];
    const errors = [];
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
                }
                catch (error) {
                    errors.push(`Failed to read ${fullPath}: ${error.message}`);
                }
            }
            else if (entry.isDirectory() && !entry.name.startsWith(".")) {
                // Recursively scan subdirectories (excluding hidden ones)
                try {
                    const subResult = await scanMdcFiles(fullPath);
                    files.push(...subResult.files);
                    errors.push(...subResult.errors);
                }
                catch (error) {
                    errors.push(`Failed to scan directory ${fullPath}: ${error.message}`);
                }
            }
        }
    }
    catch (error) {
        errors.push(`Failed to scan directory ${directoryPath}: ${error.message}`);
    }
    return {
        files,
        totalFiles: files.length,
        errors,
    };
}
// IPC Handlers
electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.GET_APP_VERSION, () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.OPEN_PROJECT_DIALOG, async () => {
    try {
        if (!mainWindow) {
            throw new Error("No main window available");
        }
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            title: "Selecionar Pasta do Projeto",
            properties: ["openDirectory"],
            message: "Escolha a pasta que contém os arquivos .mdc",
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    }
    catch (error) {
        console.error("Error opening project dialog:", error);
        throw new Error(`Falha ao abrir diálogo de seleção: ${error.message}`);
    }
});
electron_1.ipcMain.handle(ipc_1.IPC_CHANNELS.LOAD_WORKSPACE, async (event, projectPath) => {
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
        const parsedFiles = await mdc_parser_1.MdcParser.parseFiles(filePaths);
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
    }
    catch (error) {
        console.error("Error loading workspace:", error);
        return {
            success: false,
            error: `Falha ao carregar workspace: ${error.message}`,
        };
    }
});
