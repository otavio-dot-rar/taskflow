# 🎯 TaskFlow v2.0 - Hybrid Project Planning Tool

**Desktop application with dual entry points: organize existing projects or create new ones with AI**

TaskFlow is an Electron app that offers **two powerful approaches** to project management:

🔄 **Organize Existing Projects** - Transform your .mdc files into interactive Kanban visualizations  
🤖 **Create Plans with AI** - Generate complete project structures from natural language descriptions

![TaskFlow Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=TaskFlow+Multi-View+Interface)

## ✨ Features

### **Current (Phases 0-3 Complete)**

- 📁 **Project Selection** - Load any folder containing .mdc files
- 🔍 **Intelligent Parser** - Extracts frontmatter and hierarchical structure automatically
- 📊 **Multi-View System** - Dashboard (primary) and Kanban (secondary) visualizations
- ✅ **Interactive Management** - Drag-and-drop editing with real-time updates
- 📈 **Progress Analytics** - Statistics and progress tracking
- 💾 **Persistent Changes** - Auto-save with backup system
- 🎨 **Modern Interface** - Clean design with shadcn/ui and Tailwind CSS

### **Coming Soon (Phase 4 - AI Integration)**

- 🤖 **AI Project Generation** - Describe your project → Get complete .mdc structure
- 🚪 **Dual Home Screen** - Clear choice between existing and AI-created projects
- 🎯 **Smart Templates** - AI-optimized prompts for different project types
- 🔄 **Seamless Integration** - Generated projects work with existing visualization system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation & Usage

```bash
# Clone the repository
git clone <repository-url>
cd taskflow-app

# Install dependencies
pnpm install

# Run in development
pnpm dev
```

The application will open automatically in an Electron window.

### Basic Usage

1. **Select Project**: Click "Select Folder" and choose a directory with .mdc files
2. **View Dashboard**: TaskFlow automatically:
   - Scans all .mdc files recursively
   - Extracts YAML frontmatter metadata
   - Organizes content by phases and tasks
   - Shows progress and statistics
3. **Switch Views**: Toggle between Dashboard and Kanban views
4. **Edit Tasks**: Drag-and-drop or click to edit task status

### Supported .mdc Structure

```markdown
---
title: "Rule Title"
type: "task"
status: "in-progress"
priority: "high"
tags: ["development", "frontend"]
created: "2025-01-20"
assignee: "developer"
phase: "implementation"
---

# File Title

## Phase 1: Phase Name

### Stage 1.1: Stage Name

- [ ] Pending task
- [x] Completed task
  - [ ] Nested subtask
  - [x] Completed subtask

## Phase 2: Another Phase

### Stage 2.1: Another Stage

- [ ] More tasks...
```

## 🏗️ Architecture

### Tech Stack

- **Desktop**: Electron 36.5.0
- **Frontend**: Next.js 15.3.4 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Language**: TypeScript
- **State**: Zustand v5.0.5 (Phase 5)
- **Parsing**: gray-matter + remark
- **Package Manager**: pnpm

### Project Structure

```
taskflow-app/
├── backend/                    # Electron main process
│   ├── main.ts                # Entry point + IPC handlers
│   ├── preload.ts             # Secure IPC bridge
│   ├── services/              # Business logic
│   │   ├── mdc-parser.ts      # .mdc file parsing
│   │   └── ai-project-generator.ts  # AI integration (Phase 4)
│   └── types/                 # TypeScript definitions
├── frontend/                   # Next.js renderer process
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   │   ├── WorkspaceDashboard.tsx  # Main layout
│   │   ├── DashboardView.tsx       # Primary view
│   │   ├── KanbanBoard.tsx         # Secondary view
│   │   └── ui/                     # shadcn/ui components
│   └── lib/                   # Utilities
├── dist/                      # Build output
└── .cursor/rules/             # Development documentation
    ├── docs/                  # Technical reference
    │   ├── architecture.mdc   # System design
    │   ├── mdc-format.mdc     # File format spec
    │   └── ...               # Other docs
    └── tasks/                 # Development phases
        ├── task-index.mdc     # Project overview
        ├── phase-4-ai-integration.mdc  # Current work
        └── ...               # Phase files
```

### Security

- ✅ `nodeIntegration: false`
- ✅ `contextIsolation: true`
- ✅ IPC through preload script only
- ✅ No direct Node.js access in renderer

## 📊 Development Status

### ✅ Phase 0: Foundation (Complete)

- [x] Electron + Next.js + TypeScript setup
- [x] Build system and security configuration
- [x] shadcn/ui integration

### ✅ Phase 1: Reading (Complete)

- [x] .mdc parser with gray-matter
- [x] Frontmatter and hierarchical content extraction
- [x] Multi-view system (Dashboard + Kanban)
- [x] Task cards with checkboxes and progress

### ✅ Phase 2: Interaction (Complete)

- [x] Drag & drop between phases
- [x] Interactive checkbox toggling
- [x] Metadata editing via modals

### ✅ Phase 3: Persistence (Complete)

- [x] Save changes to .mdc files
- [x] Automatic backup system
- [x] Integrity validation

### 🔄 Phase 4: AI Integration (In Progress)

- [ ] Dual home screen implementation
- [ ] AI modal interface
- [ ] Backend AI setup (Gemini/OpenAI)
- [ ] Prompt engineering
- [ ] Project generation pipeline

### 📋 Phase 5: Refinements (Planned)

- [ ] Zustand state management migration
- [ ] Timeline and List views
- [ ] Performance optimizations
- [ ] Advanced search and filters

## 📚 Documentation

The project uses a **dual documentation approach**:

- **`docs/`** - Stable technical reference (architecture, patterns, APIs)
- **`tasks/`** - Dynamic development phases with detailed implementation plans

### Quick Navigation

- [📊 Project Status](/.cursor/rules/tasks/task-index.mdc) - Current progress and next steps
- [🏗️ Architecture](/.cursor/rules/docs/architecture.mdc) - System design and stack
- [🎨 UI Patterns](/.cursor/rules/docs/ui-patterns.mdc) - Design system and components
- [🔧 Development Setup](/.cursor/rules/docs/development-setup.mdc) - Environment and scripts

## 🛠️ Available Scripts

```bash
# Development
pnpm dev                 # Start Next.js + Electron
pnpm dev:next           # Next.js only (localhost:3000)
pnpm dev:electron       # Electron only

# Build
pnpm build              # Complete build
pnpm build:backend      # Compile backend TypeScript
pnpm build:frontend     # Static Next.js build

# Production
pnpm start              # Run compiled version
pnpm dist               # Generate executable (electron-builder)
```

## 🤝 Contributing

This project follows a **phase-based development approach**. Check the [task index](/.cursor/rules/tasks/task-index.mdc) for current priorities and the [Phase 4 plan](/.cursor/rules/tasks/phase-4-ai-integration.mdc) for detailed implementation tasks.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- [Cursor](https://cursor.sh) - For the inspiration of .mdc files
- [Electron](https://electronjs.org) - Desktop framework
- [Next.js](https://nextjs.org) - React framework
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

---

**Built with ❤️ using our own project as the testing ground!**
