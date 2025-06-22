import { promises as fs } from "fs";
import * as path from "path";
import matter from "gray-matter";
import {
  WorkspaceFile,
  Metadata,
  ContentData,
  Phase,
  Etapa,
  TaskItem,
} from "../types/workspace";

export class MdcParser {
  /**
   * Parse a single .mdc file and return structured data
   */
  static async parseFile(filePath: string): Promise<WorkspaceFile> {
    try {
      // Read file content
      const fileContent = await fs.readFile(filePath, "utf-8");
      const fileName = path.basename(filePath);
      const stats = await fs.stat(filePath);

      // Parse frontmatter with gray-matter
      const parsed = matter(fileContent);

      // Extract metadata from frontmatter
      const metadata: Metadata = {
        description: parsed.data.description || undefined,
        globs: parsed.data.globs || [],
        alwaysApply: Boolean(parsed.data.alwaysApply),
      };

      // Parse content structure
      const content = this.parseContent(parsed.content, fileName);

      return {
        filePath,
        fileName,
        metadata,
        content,
        lastModified: stats.mtime,
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to parse ${path.basename(filePath)}: ${errorMessage}`
      );
    }
  }

  /**
   * Parse the markdown content into hierarchical structure
   */
  private static parseContent(
    markdownContent: string,
    fileName: string
  ): ContentData {
    const lines = markdownContent.split("\n");
    const phases: Phase[] = [];
    let currentPhase: Phase | null = null;
    let currentEtapa: Etapa | null = null;
    let contentTitle: string | undefined;

    // Extract title from first # heading if present
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        contentTitle = trimmed.substring(2).trim();
        break;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) continue;

      // Parse ## Fase
      if (trimmed.startsWith("## ")) {
        // Save previous phase if exists
        if (currentPhase && currentEtapa) {
          currentPhase.etapas.push(currentEtapa);
        }
        if (currentPhase) {
          phases.push(currentPhase);
        }

        // Start new phase
        const phaseTitle = trimmed.substring(3).trim();
        currentPhase = {
          id: this.generateId("phase", phaseTitle),
          title: phaseTitle,
          etapas: [],
        };
        currentEtapa = null;
      }

      // Parse ### Etapa
      else if (trimmed.startsWith("### ")) {
        // Save previous etapa if exists
        if (currentPhase && currentEtapa) {
          currentPhase.etapas.push(currentEtapa);
        }

        // Start new etapa
        const etapaTitle = trimmed.substring(4).trim();
        currentEtapa = {
          id: this.generateId("etapa", etapaTitle),
          title: etapaTitle,
          tasks: [],
        };
      }

      // Parse tasks: - [ ] or - [x]
      else if (trimmed.match(/^-\s*\[[\sx]\]/)) {
        if (!currentEtapa) {
          // Create default etapa if task found without etapa
          currentEtapa = {
            id: this.generateId("etapa", "default"),
            title: "Tarefas",
            tasks: [],
          };
        }

        const task = this.parseTask(trimmed, i, lines);
        if (task) {
          currentEtapa.tasks.push(task);
        }
      }
    }

    // Save final etapa and phase
    if (currentPhase && currentEtapa) {
      currentPhase.etapas.push(currentEtapa);
    }
    if (currentPhase) {
      phases.push(currentPhase);
    }

    // If no phases found but we have content, create a default phase
    if (phases.length === 0 && markdownContent.trim()) {
      phases.push({
        id: this.generateId("phase", fileName),
        title: contentTitle || fileName.replace(".mdc", ""),
        etapas: [
          {
            id: this.generateId("etapa", "content"),
            title: "Conteúdo",
            tasks: [
              {
                id: this.generateId("task", "content"),
                title: "Conteúdo do arquivo",
                completed: false,
                subtasks: [],
              },
            ],
          },
        ],
      });
    }

    return {
      title: contentTitle,
      phases,
    };
  }

  /**
   * Parse a single task line and its potential subtasks
   */
  private static parseTask(
    taskLine: string,
    startIndex: number,
    allLines: string[]
  ): TaskItem | null {
    // Extract checkbox state and title
    const checkboxMatch = taskLine.match(/^-\s*\[([\sx])\]\s*(.+)$/);
    if (!checkboxMatch) return null;

    const isCompleted = checkboxMatch[1].toLowerCase() === "x";
    const title = checkboxMatch[2].trim();

    const task: TaskItem = {
      id: this.generateId("task", title),
      title: title,
      completed: isCompleted,
      subtasks: [],
    };

    // Look for subtasks (indented tasks)
    for (let i = startIndex + 1; i < allLines.length; i++) {
      const line = allLines[i];
      const trimmed = line.trim();

      // Stop if we hit another main-level item or empty line pattern
      if (
        !trimmed ||
        trimmed.startsWith("##") ||
        trimmed.match(/^-\s*\[[\sx]\]/) ||
        !line.startsWith("  ")
      ) {
        break;
      }

      // Parse subtask (indented task)
      if (trimmed.match(/^-\s*\[[\sx]\]/)) {
        const subtaskMatch = trimmed.match(/^-\s*\[([\sx])\]\s*(.+)$/);
        if (subtaskMatch) {
          const subtaskCompleted = subtaskMatch[1].toLowerCase() === "x";
          const subtaskTitle = subtaskMatch[2].trim();

          task.subtasks.push({
            id: this.generateId("subtask", subtaskTitle),
            title: subtaskTitle,
            completed: subtaskCompleted,
          });
        }
      }
    }

    return task;
  }

  /**
   * Generate a unique ID for elements
   */
  private static generateId(type: string, title: string): string {
    const normalized = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);

    // Use more precise timestamp + random component for uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}-${normalized}-${timestamp}-${random}`;
  }

  /**
   * Parse multiple files in batch
   */
  static async parseFiles(filePaths: string[]): Promise<WorkspaceFile[]> {
    const results: WorkspaceFile[] = [];
    const errors: string[] = [];

    for (const filePath of filePaths) {
      try {
        const parsed = await this.parseFile(filePath);
        results.push(parsed);
      } catch (error) {
        console.error(`Failed to parse ${filePath}:`, error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`${path.basename(filePath)}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`Parsing completed with ${errors.length} errors:`, errors);
    }

    return results;
  }
}
