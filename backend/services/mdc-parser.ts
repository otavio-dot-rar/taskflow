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
        type: parsed.data.type,
        status: parsed.data.status,
        priority: parsed.data.priority,
        phase: parsed.data.phase,
        tags: parsed.data.tags,
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
      console.error(`[Parser] Error parsing file ${filePath}:`, error);
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

    // Extract title from first # heading - this becomes the main phase
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        contentTitle = trimmed.substring(2).trim();

        // Create main phase from the title
        currentPhase = {
          id: this.generateId("phase", contentTitle),
          title: contentTitle,
          etapas: [],
        };
        break;
      }
    }

    // If no title found, create default phase from filename
    if (!currentPhase) {
      const defaultTitle = fileName.replace(".mdc", "").replace(/-/g, " ");
      currentPhase = {
        id: this.generateId("phase", defaultTitle),
        title: defaultTitle,
        etapas: [],
      };
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and the main title (already processed)
      if (!trimmed || trimmed.startsWith("# ")) continue;

      // Parse ## sections
      if (trimmed.startsWith("## ")) {
        const sectionTitle = trimmed.substring(3).trim();

        // Save previous etapa before creating new one
        if (currentEtapa) {
          currentPhase.etapas.push(currentEtapa);
        }

        // Check if this is a Task (🔧 Task X.Y: format)
        const taskMatch = sectionTitle.match(/^🔧\s+Task\s+[\d.]+:\s*(.+)$/);
        if (taskMatch) {
          // This is a Task - create etapa for it
          const taskName = taskMatch[1].trim();
          currentEtapa = {
            id: this.generateId("etapa", `task-${taskName}`),
            title: sectionTitle, // Keep full "🔧 Task X.Y: Name" format
            tasks: [],
          };
        } else {
          // This is a regular section - create etapa
          currentEtapa = {
            id: this.generateId("etapa", sectionTitle),
            title: sectionTitle,
            tasks: [],
          };
        }
      }

      // Parse ### sections (subsections within tasks/etapas)
      else if (trimmed.startsWith("### ")) {
        const subsectionTitle = trimmed.substring(4).trim();
        const cleanTitle = subsectionTitle.replace(/\*\*/g, "").trim();

        // Skip status lines and implementation sections, but keep sections that might contain tasks
        if (
          cleanTitle.startsWith("Status:") ||
          cleanTitle === "Objetivo" ||
          cleanTitle === "Implementação" ||
          cleanTitle === "Como Testar" ||
          cleanTitle.startsWith("Arquivos a") ||
          cleanTitle.startsWith("Design da") ||
          cleanTitle.startsWith("Código de")
        ) {
          continue;
        }

        // For "Critérios de Aceite" and "Overview das Tasks", collect the tasks below
        if (
          cleanTitle === "Critérios de Aceite" ||
          cleanTitle.includes("Critérios") ||
          cleanTitle === "Overview das Tasks" ||
          cleanTitle.includes("Overview")
        ) {
          // Don't create new etapa, just continue to collect tasks in current etapa
          continue;
        }

        // For other important subsections that might contain tasks, don't skip them
        if (
          cleanTitle.includes("Tasks") ||
          cleanTitle.includes("Tarefas") ||
          cleanTitle.includes("Status Geral")
        ) {
          continue;
        }

        // For other subsections, we could create sub-etapas
        // But for now, let's keep it simple and not create nested etapas
        continue;
      }

      // Parse tasks: - [ ] or - [x]
      else if (trimmed.match(/^-\s*\[[\sx]\]/)) {
        if (!currentEtapa) {
          // Create default etapa if task found without etapa
          currentEtapa = {
            id: this.generateId("etapa", "tasks"),
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

    // Save final etapa
    if (currentEtapa) {
      currentPhase.etapas.push(currentEtapa);
    }

    // Add the phase to phases array
    phases.push(currentPhase);

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
