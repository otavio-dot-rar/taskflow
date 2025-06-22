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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdcParser = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
class MdcParser {
    /**
     * Parse a single .mdc file and return structured data
     */
    static async parseFile(filePath) {
        try {
            // Read file content
            const fileContent = await fs_1.promises.readFile(filePath, "utf-8");
            const fileName = path.basename(filePath);
            const stats = await fs_1.promises.stat(filePath);
            // Parse frontmatter with gray-matter
            const parsed = (0, gray_matter_1.default)(fileContent);
            // Extract metadata from frontmatter
            const metadata = {
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
        }
        catch (error) {
            console.error(`Error parsing file ${filePath}:`, error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to parse ${path.basename(filePath)}: ${errorMessage}`);
        }
    }
    /**
     * Parse the markdown content into hierarchical structure
     */
    static parseContent(markdownContent, fileName) {
        const lines = markdownContent.split("\n");
        const phases = [];
        let currentPhase = null;
        let currentEtapa = null;
        let contentTitle;
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
            if (!trimmed)
                continue;
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
    static parseTask(taskLine, startIndex, allLines) {
        // Extract checkbox state and title
        const checkboxMatch = taskLine.match(/^-\s*\[([\sx])\]\s*(.+)$/);
        if (!checkboxMatch)
            return null;
        const isCompleted = checkboxMatch[1].toLowerCase() === "x";
        const title = checkboxMatch[2].trim();
        const task = {
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
            if (!trimmed ||
                trimmed.startsWith("##") ||
                trimmed.match(/^-\s*\[[\sx]\]/) ||
                !line.startsWith("  ")) {
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
    static generateId(type, title) {
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
    static async parseFiles(filePaths) {
        const results = [];
        const errors = [];
        for (const filePath of filePaths) {
            try {
                const parsed = await this.parseFile(filePath);
                results.push(parsed);
            }
            catch (error) {
                console.error(`Failed to parse ${filePath}:`, error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                errors.push(`${path.basename(filePath)}: ${errorMessage}`);
            }
        }
        if (errors.length > 0) {
            console.warn(`Parsing completed with ${errors.length} errors:`, errors);
        }
        return results;
    }
}
exports.MdcParser = MdcParser;
