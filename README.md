# 🎯 Cursor TaskFlow

**Aplicativo desktop para visualizar e gerenciar arquivos .mdc em interface Kanban**

TaskFlow é um aplicativo Electron que transforma seus arquivos de regras do Cursor (.mdc) em uma visualização Kanban interativa, facilitando o acompanhamento de projetos e tarefas estruturadas.

![TaskFlow Screenshot](https://via.placeholder.com/800x400/2563eb/ffffff?text=TaskFlow+Kanban+Interface)

## ✨ Funcionalidades

- 📁 **Seleção de Projeto** - Escolha qualquer pasta contendo arquivos .mdc
- 🔍 **Parser Inteligente** - Extrai automaticamente frontmatter e estrutura hierárquica
- 📋 **Visualização Kanban** - Organiza `## Fases`, `### Etapas` e `- [ ] Tarefas`
- ✅ **Status Visual** - Checkboxes, progresso e estatísticas em tempo real
- 🎨 **Interface Moderna** - Design limpo com shadcn/ui e Tailwind CSS
- ⚡ **Performance** - Construído com Electron + Next.js + TypeScript

## 🚀 Como Usar

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado)

### Instalação e Execução

```bash
# Clone o repositório
git clone <repository-url>
cd taskflow-app

# Instale as dependências
pnpm install

# Execute em desenvolvimento
pnpm dev
```

O aplicativo abrirá automaticamente em uma janela Electron.

### Uso Básico

1. **Selecionar Projeto**: Clique em "Selecionar Pasta" e escolha um diretório com arquivos .mdc
2. **Visualizar Kanban**: O TaskFlow automaticamente:
   - Escaneia todos os arquivos .mdc recursivamente
   - Extrai metadados do frontmatter YAML
   - Organiza o conteúdo em colunas por fase
   - Mostra progresso e estatísticas

### Estrutura .mdc Suportada

```markdown
---
description: "Descrição da regra"
alwaysApply: true
globs: ["*.ts", "*.tsx"]
---

# Título do Arquivo

## Fase 1: Nome da Fase

### Etapa 1.1: Nome da Etapa

- [ ] Tarefa pendente
- [x] Tarefa concluída
  - [ ] Subtarefa aninhada
  - [x] Subtarefa concluída

## Fase 2: Outra Fase

### Etapa 2.1: Outra Etapa

- [ ] Mais tarefas...
```

## 🏗️ Arquitetura

### Stack Tecnológica

- **Desktop**: Electron 36.5.0
- **Frontend**: Next.js 15.3.4 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Linguagem**: TypeScript
- **Parsing**: gray-matter + remark
- **Gerenciador**: pnpm

### Estrutura do Projeto

```
taskflow-app/
├── backend/              # Processo Principal Electron
│   ├── main.ts          # Entry point + IPC handlers
│   ├── preload.ts       # Bridge IPC segura
│   ├── services/        # Parser .mdc e lógica de negócio
│   └── types/           # Tipos TypeScript backend
├── frontend/            # Processo Renderer (Next.js)
│   ├── app/            # Next.js App Router
│   ├── components/     # Componentes React + shadcn/ui
│   ├── types/          # Tipos TypeScript frontend
│   └── lib/            # Utilitários e configurações
└── dist/               # Build compilado
```

### Segurança

- ✅ `nodeIntegration: false`
- ✅ `contextIsolation: true`
- ✅ IPC através de preload script
- ✅ Sem acesso direto ao Node.js no renderer

## 📊 Status de Desenvolvimento

### ✅ Fase 1: Leitura e Visualização (Completa)

- [x] Parser de arquivos .mdc com gray-matter
- [x] Extração de frontmatter e conteúdo hierárquico
- [x] Interface Kanban com colunas por fase
- [x] Cards de tarefas com checkboxes e progresso
- [x] Estatísticas em tempo real

### 🔄 Fase 2: Interatividade (Planejada)

- [ ] Drag & drop de tarefas entre fases
- [ ] Toggle de checkboxes interativo
- [ ] Edição de metadados via modal

### 🔄 Fase 3: Persistência (Planejada)

- [ ] Salvamento de mudanças nos arquivos .mdc
- [ ] Sistema de backup automático
- [ ] Validação de integridade

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                 # Inicia Next.js + Electron
pnpm dev:next           # Apenas Next.js (localhost:3000)
pnpm dev:electron       # Apenas Electron

# Build
pnpm build              # Build completo
pnpm build:backend      # Compila backend TypeScript
pnpm build:frontend     # Build estático Next.js

# Produção
pnpm start              # Executa versão compilada
pnpm package            # Gera executável (electron-builder)
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [Cursor](https://cursor.sh) - Pela inspiração dos arquivos .mdc
- [Electron](https://electronjs.org) - Framework desktop
- [Next.js](https://nextjs.org) - Framework React
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
