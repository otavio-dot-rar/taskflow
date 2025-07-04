import * as fs from "fs/promises";
import * as path from "path";
import { WorkspaceFile } from "../types/workspace";

export interface BackupOptions {
  maxBackups?: number; // Maximum number of backups per file
  backupDir?: string; // Custom backup directory (defaults to .backups)
  enabled?: boolean; // Enable/disable backup system
}

export interface BackupInfo {
  originalPath: string;
  backupPath: string;
  timestamp: Date;
  fileSize: number;
  success: boolean;
  error?: string;
}

export class BackupManager {
  private static readonly DEFAULT_MAX_BACKUPS = 10;
  private static readonly DEFAULT_BACKUP_DIR = ".backups";

  /**
   * Create a backup of a file before modification
   */
  static async createBackup(
    filePath: string,
    options: BackupOptions = {}
  ): Promise<BackupInfo> {
    const { maxBackups = this.DEFAULT_MAX_BACKUPS, enabled = true } = options;

    if (!enabled) {
      return {
        originalPath: filePath,
        backupPath: "",
        timestamp: new Date(),
        fileSize: 0,
        success: true, // Consider it successful if disabled
      };
    }

    try {
      // Check if original file exists
      const stats = await fs.stat(filePath);

      // Create backup directory
      const backupDir = this.getBackupDir(filePath, options.backupDir);
      await this.ensureBackupDir(backupDir);

      // Generate backup filename
      const backupPath = this.generateBackupPath(filePath, backupDir);

      // Copy file to backup location
      await fs.copyFile(filePath, backupPath);

      // Cleanup old backups
      await this.cleanupOldBackups(filePath, backupDir, maxBackups);

      return {
        originalPath: filePath,
        backupPath,
        timestamp: new Date(),
        fileSize: stats.size,
        success: true,
      };
    } catch (error) {
      console.error(`[BackupManager] Failed to create backup for ${filePath}:`, error);
      return {
        originalPath: filePath,
        backupPath: "",
        timestamp: new Date(),
        fileSize: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create backups for multiple files
   */
  static async createBackups(
    files: WorkspaceFile[],
    options: BackupOptions = {}
  ): Promise<BackupInfo[]> {
    const results: BackupInfo[] = [];

    for (const file of files) {
      if (file.hasChanges) {
        const backupInfo = await this.createBackup(file.filePath, options);
        results.push(backupInfo);
      }
    }

    return results;
  }

  /**
   * Restore a file from backup
   */
  static async restoreFromBackup(
    originalPath: string,
    backupPath?: string,
    options: BackupOptions = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let targetBackupPath = backupPath;

      // If no specific backup path provided, find the most recent one
      if (!targetBackupPath) {
        const backupDir = this.getBackupDir(originalPath, options.backupDir);
        const recentBackup = await this.findMostRecentBackup(originalPath, backupDir);
        
        if (!recentBackup) {
          return {
            success: false,
            error: "No backup found for this file",
          };
        }
        
        targetBackupPath = recentBackup;
      }

      // Check if backup exists
      await fs.access(targetBackupPath);

      // Restore the file
      await fs.copyFile(targetBackupPath, originalPath);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[BackupManager] Failed to restore ${originalPath}:`, error);
      return {
        success: false,
        error: `Failed to restore from backup: ${errorMessage}`,
      };
    }
  }

  /**
   * List all backups for a file
   */
  static async listBackups(
    filePath: string,
    options: BackupOptions = {}
  ): Promise<{ path: string; timestamp: Date; size: number }[]> {
    try {
      const backupDir = this.getBackupDir(filePath, options.backupDir);
      const fileName = path.basename(filePath, ".mdc");
      
      // Check if backup directory exists
      try {
        await fs.access(backupDir);
      } catch {
        return []; // No backups exist
      }

      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      const backups: { path: string; timestamp: Date; size: number }[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.startsWith(`${fileName}.backup-`)) {
          const backupPath = path.join(backupDir, entry.name);
          const stats = await fs.stat(backupPath);
          
          // Extract timestamp from filename
          const timestampMatch = entry.name.match(/\.backup-(.+)\.mdc$/);
          const timestamp = timestampMatch 
            ? new Date(timestampMatch[1].replace(/-/g, ':'))
            : stats.mtime;

          backups.push({
            path: backupPath,
            timestamp,
            size: stats.size,
          });
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error(`[BackupManager] Failed to list backups for ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Delete old backups beyond the limit
   */
  private static async cleanupOldBackups(
    originalPath: string,
    backupDir: string,
    maxBackups: number
  ): Promise<void> {
    try {
      const backups = await this.listBackups(originalPath, { backupDir });

      if (backups.length > maxBackups) {
        const backupsToDelete = backups.slice(maxBackups);
        
        for (const backup of backupsToDelete) {
          try {
            await fs.unlink(backup.path);
            console.log(`[BackupManager] Deleted old backup: ${backup.path}`);
          } catch (error) {
            console.warn(`[BackupManager] Failed to delete backup ${backup.path}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`[BackupManager] Failed to cleanup old backups:`, error);
    }
  }

  /**
   * Find the most recent backup for a file
   */
  private static async findMostRecentBackup(
    originalPath: string,
    backupDir: string
  ): Promise<string | null> {
    const backups = await this.listBackups(originalPath, { backupDir });
    return backups.length > 0 ? backups[0].path : null;
  }

  /**
   * Generate backup file path with timestamp
   */
  private static generateBackupPath(originalPath: string, backupDir: string): string {
    const fileName = path.basename(originalPath, ".mdc");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `${fileName}.backup-${timestamp}.mdc`;
    
    return path.join(backupDir, backupFileName);
  }

  /**
   * Get backup directory path
   */
  private static getBackupDir(filePath: string, customBackupDir?: string): string {
    if (customBackupDir) {
      return customBackupDir;
    }

    const fileDir = path.dirname(filePath);
    return path.join(fileDir, this.DEFAULT_BACKUP_DIR);
  }

  /**
   * Ensure backup directory exists
   */
  private static async ensureBackupDir(backupDir: string): Promise<void> {
    try {
      await fs.access(backupDir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(backupDir, { recursive: true });
    }
  }

  /**
   * Get backup statistics for a project
   */
  static async getBackupStats(
    projectPath: string,
    options: BackupOptions = {}
  ): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  }> {
    try {
      const backupDir = this.getBackupDir(projectPath, options.backupDir);
      
      try {
        await fs.access(backupDir);
      } catch {
        return { totalBackups: 0, totalSize: 0 };
      }

      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      let totalBackups = 0;
      let totalSize = 0;
      let oldestBackup: Date | undefined;
      let newestBackup: Date | undefined;

      for (const entry of entries) {
        if (entry.isFile() && entry.name.includes(".backup-")) {
          const backupPath = path.join(backupDir, entry.name);
          const stats = await fs.stat(backupPath);
          
          totalBackups++;
          totalSize += stats.size;
          
          if (!oldestBackup || stats.mtime < oldestBackup) {
            oldestBackup = stats.mtime;
          }
          
          if (!newestBackup || stats.mtime > newestBackup) {
            newestBackup = stats.mtime;
          }
        }
      }

      return {
        totalBackups,
        totalSize,
        oldestBackup,
        newestBackup,
      };
    } catch (error) {
      console.error(`[BackupManager] Failed to get backup stats:`, error);
      return { totalBackups: 0, totalSize: 0 };
    }
  }

  /**
   * Clean all backups for a project
   */
  static async cleanAllBackups(
    projectPath: string,
    options: BackupOptions = {}
  ): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      const backupDir = this.getBackupDir(projectPath, options.backupDir);
      
      try {
        await fs.access(backupDir);
      } catch {
        return { success: true, deletedCount: 0 }; // No backups to delete
      }

      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      let deletedCount = 0;

      for (const entry of entries) {
        if (entry.isFile() && entry.name.includes(".backup-")) {
          const backupPath = path.join(backupDir, entry.name);
          await fs.unlink(backupPath);
          deletedCount++;
        }
      }

      // Remove backup directory if empty
      const remainingEntries = await fs.readdir(backupDir);
      if (remainingEntries.length === 0) {
        await fs.rmdir(backupDir);
      }

      return { success: true, deletedCount };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[BackupManager] Failed to clean backups:`, error);
      return {
        success: false,
        deletedCount: 0,
        error: errorMessage,
      };
    }
  }
}