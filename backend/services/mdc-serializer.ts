import matter from "gray-matter";
import {
  WorkspaceFile,
  Metadata,
  ContentData,
  Phase,
  Etapa,
  TaskItem,
  SubTask,
} from "../types/workspace";

export class MdcSerializer {
  /**
   * Serialize a WorkspaceFile back to .mdc format
   */
  static serialize(workspaceFile: WorkspaceFile): string {
    try {
      // Generate the frontmatter
      const frontmatterContent = this.serializeFrontmatter(workspaceFile.metadata);
      
      // Generate the markdown content
      const markdownContent = this.serializeContent(workspaceFile.content);
      
      // Combine frontmatter and content
      const fullContent = matter.stringify(markdownContent, frontmatterContent);
      
      return fullContent;
    } catch (error) {
      console.error(`[Serializer] Error serializing file ${workspaceFile.fileName}:`, error);
      throw new Error(`Failed to serialize ${workspaceFile.fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Serialize multiple files to their .mdc formats
   */
  static serializeFiles(files: WorkspaceFile[]): Map<string, string> {
    const results = new Map<string, string>();
    const errors: string[] = [];

    for (const file of files) {
      try {
        const serialized = this.serialize(file);
        results.set(file.filePath, serialized);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${file.fileName}: ${errorMessage}`);
        console.error(`Failed to serialize ${file.fileName}:`, error);
      }
    }

    if (errors.length > 0) {
      console.warn(`Serialization completed with ${errors.length} errors:`, errors);
    }

    return results;
  }

  /**
   * Serialize metadata to YAML frontmatter
   */
  private static serializeFrontmatter(metadata: Metadata): Record<string, any> {
    const frontmatter: Record<string, any> = {};

    // === CURSOR FIELDS (obrigatórios para compatibilidade) ===
    if (metadata.description !== undefined) {
      frontmatter.description = metadata.description;
    }
    
    if (metadata.globs !== undefined) {
      frontmatter.globs = metadata.globs;
    }
    
    frontmatter.alwaysApply = Boolean(metadata.alwaysApply);

    // === TASKFLOW CORE FIELDS ===
    if (metadata.type !== undefined) {
      frontmatter.type = metadata.type;
    }
    
    if (metadata.status !== undefined) {
      frontmatter.status = metadata.status;
    }
    
    if (metadata.priority !== undefined) {
      frontmatter.priority = metadata.priority;
    }
    
    if (metadata.phase !== undefined) {
      frontmatter.phase = metadata.phase;
    }
    
    if (metadata.tags !== undefined && metadata.tags.length > 0) {
      frontmatter.tags = metadata.tags;
    }

    return frontmatter;
  }

  /**
   * Serialize content structure to markdown
   */
  private static serializeContent(content: ContentData): string {
    let markdown = "";

    // Add main title if exists
    if (content.title) {
      markdown += `# ${content.title}\n\n`;
    }

    // Serialize each phase
    for (const phase of content.phases) {
      const phaseMarkdown = this.serializePhase(phase);
      if (phaseMarkdown.trim()) {
        markdown += phaseMarkdown + "\n";
      }
    }

    return markdown.trim();
  }

  /**
   * Serialize a single phase to markdown
   */
  private static serializePhase(phase: Phase): string {
    let markdown = "";

    // If this is the main phase with the same title as the document title,
    // don't add a separate ## heading for it, just process its etapas
    const isMainPhase = phase.title && !phase.title.startsWith("Phase") && !phase.title.startsWith("Fase");
    
    if (!isMainPhase && phase.title) {
      markdown += `## ${phase.title}\n\n`;
    }

    // Serialize each etapa
    for (const etapa of phase.etapas) {
      const etapaMarkdown = this.serializeEtapa(etapa);
      if (etapaMarkdown.trim()) {
        markdown += etapaMarkdown + "\n";
      }
    }

    return markdown;
  }

  /**
   * Serialize a single etapa to markdown
   */
  private static serializeEtapa(etapa: Etapa): string {
    let markdown = "";

    // Add etapa title as ## heading
    if (etapa.title) {
      markdown += `## ${etapa.title}\n\n`;
    }

    // Add tasks with proper format
    if (etapa.tasks.length > 0) {
      // Add "Critérios de Aceite" section if tasks exist
      markdown += `### Critérios de Aceite\n`;
      
      // Serialize each task
      for (const task of etapa.tasks) {
        const taskMarkdown = this.serializeTask(task);
        if (taskMarkdown.trim()) {
          markdown += taskMarkdown;
        }
      }
      
      markdown += "\n";
    }

    return markdown;
  }

  /**
   * Serialize a single task to markdown
   */
  private static serializeTask(task: TaskItem): string {
    let markdown = "";

    // Main task checkbox
    const checkbox = task.completed ? "[x]" : "[ ]";
    markdown += `- ${checkbox} ${task.title}\n`;

    // Subtasks (indented)
    for (const subtask of task.subtasks) {
      const subtaskMarkdown = this.serializeSubTask(subtask);
      if (subtaskMarkdown.trim()) {
        markdown += subtaskMarkdown;
      }
    }

    return markdown;
  }

  /**
   * Serialize a single subtask to markdown
   */
  private static serializeSubTask(subtask: SubTask): string {
    const checkbox = subtask.completed ? "[x]" : "[ ]";
    return `  - ${checkbox} ${subtask.title}\n`;
  }

  /**
   * Validate if a serialized content can be parsed back correctly
   */
  static validate(serializedContent: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Parse the frontmatter
      const parsed = matter(serializedContent);
      
      // Check if frontmatter is valid
      if (!parsed.data) {
        errors.push("Invalid or missing frontmatter");
      } else {
        // Validate required fields
        if (parsed.data.alwaysApply === undefined) {
          errors.push("Missing required field: alwaysApply");
        }
      }

      // Check if content has basic structure
      if (!parsed.content || parsed.content.trim().length === 0) {
        errors.push("Missing or empty content");
      }

      // Validate markdown structure
      const lines = parsed.content.split('\n');
      let hasValidStructure = false;
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Check for any heading structure
        if (trimmed.startsWith('#') || trimmed.match(/^-\s*\[[\sx]\]/)) {
          hasValidStructure = true;
          break;
        }
      }

      if (!hasValidStructure) {
        errors.push("Content lacks proper markdown structure (no headings or tasks found)");
      }

    } catch (error) {
      errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a backup-friendly filename
   */
  static createBackupFilename(originalPath: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalPath.endsWith('.mdc') ? '.mdc' : '';
    const baseName = originalPath.replace(/\.mdc$/, '');
    
    return `${baseName}.backup-${timestamp}${extension}`;
  }

  /**
   * Generate a new empty .mdc file template
   */
  static generateTemplate(options: {
    title?: string;
    type?: "task" | "documentation" | "reference";
    alwaysApply?: boolean;
    description?: string;
  }): string {
    const metadata: Metadata = {
      description: options.description || "",
      globs: [],
      alwaysApply: options.alwaysApply || false,
      type: options.type || "task",
      status: "todo",
      priority: "medium",
      tags: []
    };

    const content: ContentData = {
      title: options.title || "Novo Arquivo",
      phases: [{
        id: `phase-${Date.now()}`,
        title: options.title || "Novo Arquivo",
        etapas: [{
          id: `etapa-${Date.now()}`,
          title: "🔧 Task 1.1: Primeira Tarefa",
          tasks: [{
            id: `task-${Date.now()}`,
            title: "Implementar funcionalidade básica",
            completed: false,
            subtasks: []
          }]
        }]
      }]
    };

    const workspaceFile: WorkspaceFile = {
      filePath: '',
      fileName: 'template.mdc',
      metadata,
      content,
      lastModified: new Date()
    };

    return this.serialize(workspaceFile);
  }
}