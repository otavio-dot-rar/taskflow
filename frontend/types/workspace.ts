// Core workspace types
export interface WorkspaceData {
  projectPath: string;
  files: WorkspaceFile[];
  loadedAt: string;
  scanErrors?: string[]; // Optional array of scan error messages
}

export interface WorkspaceFile {
  filePath: string;
  fileName: string;
  metadata: Metadata;
  content: ContentData;
  lastModified: Date;
  hasChanges?: boolean;
}

// Metadata from .mdc frontmatter (based on real .mdc files)
export interface Metadata {
  description?: string; // Present only for Agent Requested rules
  globs?: string | string[]; // Usually empty
  alwaysApply: boolean; // true = Always, false = Agent Requested/Manual
  // Legacy/computed fields
  priority?: "high" | "medium" | "low";
  tags?: string[];
}

// File content structure
export interface ContentData {
  title?: string;
  phases: Phase[];
}

// Kanban structure - hierarchical content
export interface Phase {
  id: string;
  title: string;
  etapas: Etapa[];
}

export interface Etapa {
  id: string;
  title: string;
  tasks: TaskItem[];
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

// Legacy interfaces for compatibility
export interface Step {
  type: "step";
  id: string;
  name: string;
}

export interface Task {
  type: "task";
  id: string;
  text: string;
  completed: boolean;
  subtasks: SubTask[];
  originalPhaseId: string;
}

// UI State types
export interface DragData {
  taskId: string;
  phaseId: string;
  fileId: string;
}

// API Response types
export interface SaveResult {
  success: boolean;
  results?: FileSaveResult[];
  error?: string;
  message: string;
}

export interface FileSaveResult {
  filePath: string;
  success: boolean;
  savedAt: string;
  error?: string;
}

// Task state computed from subtasks
export type TaskState = "pending" | "in-progress" | "completed";

// Rule type computed from alwaysApply and description presence
export type RuleType = "Always" | "Agent Requested" | "Manual";

// Helper function to get rule type from metadata
export function getRuleType(metadata: Metadata): RuleType {
  if (metadata.alwaysApply) return "Always";
  if (metadata.description && metadata.description.trim() !== "")
    return "Agent Requested";
  return "Manual"; // alwaysApply: false but no description
}

// File parsing types
export interface ParsedMdcFile {
  filePath: string;
  frontmatter: Metadata;
  content: string;
  parsedContent: ContentData;
}

// Error types
export interface WorkspaceError {
  type:
    | "PARSE_ERROR"
    | "FILE_NOT_FOUND"
    | "PERMISSION_DENIED"
    | "UNKNOWN_ERROR";
  message: string;
  filePath?: string;
  details?: Record<string, unknown>;
}
