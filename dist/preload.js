"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// IPC Channel names (hardcoded to avoid import issues in preload)
const IPC_CHANNELS = {
    GET_APP_VERSION: "get-app-version",
    OPEN_PROJECT_DIALOG: "open-project-dialog",
    LOAD_WORKSPACE: "load-workspace",
};
// Expose the API to the renderer process
const electronAPI = {
    getAppVersion: () => electron_1.ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
    // Project operations
    openProjectDialog: () => electron_1.ipcRenderer.invoke(IPC_CHANNELS.OPEN_PROJECT_DIALOG),
    loadWorkspace: (projectPath) => electron_1.ipcRenderer.invoke(IPC_CHANNELS.LOAD_WORKSPACE, projectPath),
};
// Use contextBridge to securely expose the API
electron_1.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
// Debug log to confirm preload is running
console.log("[Preload] ElectronAPI exposed to window:", electronAPI);
