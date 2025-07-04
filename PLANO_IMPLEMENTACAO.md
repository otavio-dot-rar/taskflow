# Plano de Implementação: Cursor TaskFlow - Editor/Organizador de .mdc

## 🎯 Objetivo Geral

Transformar o projeto atual em um **leitor E EDITOR completo** de arquivos .mdc (Cursor Rules) com capacidades de:
- Leitura e exibição de arquivos .mdc 
- Edição em tempo real de conteúdo e metadados
- Organização de tarefas (adicionar, remover, reorganizar)
- Alteração de Frontmatter (YAML Headers)
- Reorganização de arquivos e estruturas
- Futuramente: IA integrada para criação de documentação

## 📊 Estado Atual (Análise)

### ✅ **O que JÁ FUNCIONA**
- **Leitura**: Parser de .mdc implementado e funcional
- **Visualização**: Dashboard e Kanban views operacionais
- **Interface**: shadcn/ui + Tailwind CSS bem configurados
- **Arquitetura**: Electron + Next.js + TypeScript estruturado
- **Drag & Drop**: Movimentação de tarefas entre colunas
- **IPC**: Comunicação segura main/renderer funcionando

### ❌ **O que PRECISA SER IMPLEMENTADO**
- **Edição**: Nenhuma capacidade de edição implementada
- **Persistência**: Não salva alterações de volta aos arquivos
- **Criação**: Não pode adicionar novas tarefas/arquivos
- **Metadados**: Não pode editar frontmatter YAML
- **Reorganização**: Não pode reorganizar estrutura de arquivos
- **Validação**: Sem validação de integridade dos .mdc

## 🏗️ Plano de Implementação

### **Fase 1: Fundação da Edição (3-5 dias)**

#### 1.1 Serialização de Volta para .mdc
- [ ] **MdcSerializer Service** - Converter JSON → Markdown
- [ ] **Frontmatter regeneration** - Regenerar YAML headers
- [ ] **Content reconstruction** - Reconstruir markdown hierarchy
- [ ] **Backup system** - Backup automático antes de editar

#### 1.2 Salvamento de Arquivos
- [ ] **Save IPC handlers** - Implementar canal IPC para salvar
- [ ] **File writing** - Escrever arquivos alterados no disco
- [ ] **Change tracking** - Rastrear quais arquivos foram modificados
- [ ] **Error recovery** - Sistema de recuperação em caso de erro

#### 1.3 Interface de Salvamento
- [ ] **Save indicator** - Indicador visual de alterações não salvas
- [ ] **Save button** - Botão de salvar no header
- [ ] **Auto-save** - Salvamento automático opcional
- [ ] **Keyboard shortcuts** - Ctrl+S para salvar

### **Fase 2: Edição de Tarefas (2-3 dias)**

#### 2.1 Adição de Novas Tarefas
- [ ] **Add Task modal** - Modal para criar nova tarefa
- [ ] **Task form** - Formulário com título, status, prioridade
- [ ] **Position selection** - Escolher onde inserir a tarefa
- [ ] **ID generation** - Gerar IDs únicos para novas tarefas

#### 2.2 Edição de Tarefas Existentes
- [ ] **Edit Task modal** - Modal para editar tarefa existente
- [ ] **Inline editing** - Edição inline do título da tarefa
- [ ] **Status toggle** - Mudar status de tarefas
- [ ] **Subtask management** - Adicionar/editar/remover subtarefas

#### 2.3 Remoção de Tarefas
- [ ] **Delete confirmation** - Modal de confirmação para deletar
- [ ] **Bulk operations** - Selecionar múltiplas tarefas
- [ ] **Undo system** - Sistema de desfazer alterações

### **Fase 3: Edição de Metadados (2-3 dias)**

#### 3.1 Editor de Frontmatter
- [ ] **YAML editor** - Editor especializado para YAML
- [ ] **Metadata form** - Formulário estruturado para metadados
- [ ] **Validation** - Validação de campos obrigatórios
- [ ] **Preview** - Preview do YAML gerado

#### 3.2 Propriedades Editáveis
- [ ] **description** - Editar descrição da regra
- [ ] **globs** - Editar padrões glob
- [ ] **alwaysApply** - Toggle always apply
- [ ] **type, status, priority** - Editar propriedades customizadas
- [ ] **tags** - Sistema de tags editável

#### 3.3 Templates de Metadados
- [ ] **Rule templates** - Templates para diferentes tipos de regra
- [ ] **Quick settings** - Ações rápidas para configurações comuns
- [ ] **Bulk metadata** - Aplicar metadados em lote

### **Fase 4: Gestão de Arquivos (3-4 dias)**

#### 4.1 Criação de Novos Arquivos
- [ ] **New file wizard** - Assistente para criar novo .mdc
- [ ] **File templates** - Templates para diferentes tipos
- [ ] **Naming conventions** - Sugestões de nomenclatura
- [ ] **Location picker** - Escolher onde criar o arquivo

#### 4.2 Reorganização de Arquivos
- [ ] **File tree view** - Visualização em árvore dos arquivos
- [ ] **Drag & drop files** - Mover arquivos entre pastas
- [ ] **Rename files** - Renomear arquivos com validação
- [ ] **Folder operations** - Criar/mover/deletar pastas

#### 4.3 Estrutura de Projeto
- [ ] **Project structure** - Definir estrutura padrão de pastas
- [ ] **Import/Export** - Importar projetos existentes
- [ ] **Migration tools** - Migrar estruturas antigas

### **Fase 5: Interface Avançada (2-3 dias)**

#### 5.1 Editor de Conteúdo Rich
- [ ] **Markdown editor** - Editor wysiwyg para conteúdo
- [ ] **Preview mode** - Visualização do markdown renderizado
- [ ] **Split view** - Editor + preview lado a lado
- [ ] **Syntax highlighting** - Destaque de sintaxe markdown

#### 5.2 Interface de Organização
- [ ] **Reorder tasks** - Reordenar tarefas por drag & drop
- [ ] **Phase management** - Criar/editar/deletar fases
- [ ] **Etapa management** - Gerenciar etapas dentro de fases
- [ ] **Hierarchical editing** - Edição hierárquica da estrutura

#### 5.3 Funcionalidades de Produtividade
- [ ] **Search & filter** - Busca avançada em conteúdo
- [ ] **Quick actions** - Ações rápidas via teclado
- [ ] **Bulk operations** - Operações em lote
- [ ] **Favorites** - Sistema de favoritos

### **Fase 6: Preparação para IA (1-2 dias)**

#### 6.1 Estrutura para IA
- [ ] **AI project generator** - Estrutura base para geração IA
- [ ] **Template system** - Sistema de templates para IA
- [ ] **Content validation** - Validação de conteúdo gerado
- [ ] **Integration points** - Pontos de integração com APIs

#### 6.2 Extensibilidade
- [ ] **Plugin system** - Sistema básico de plugins
- [ ] **Custom templates** - Templates customizáveis pelo usuário
- [ ] **Export formats** - Exportação para outros formatos
- [ ] **API preparation** - Preparação para APIs externas

## 🛠️ Detalhamento Técnico

### **Arquivos Novos a Criar**

#### Backend Services
- `backend/services/mdc-serializer.ts` - Serialização JSON → .mdc
- `backend/services/file-manager.ts` - Gestão de arquivos e pastas
- `backend/services/backup-manager.ts` - Sistema de backup
- `backend/services/metadata-validator.ts` - Validação de metadados

#### Frontend Components
- `frontend/components/editors/TaskEditor.tsx` - Editor de tarefas
- `frontend/components/editors/MetadataEditor.tsx` - Editor de metadados
- `frontend/components/editors/ContentEditor.tsx` - Editor de conteúdo
- `frontend/components/modals/NewTaskModal.tsx` - Modal nova tarefa
- `frontend/components/modals/EditTaskModal.tsx` - Modal editar tarefa
- `frontend/components/modals/MetadataModal.tsx` - Modal metadados
- `frontend/components/file-tree/FileTree.tsx` - Árvore de arquivos
- `frontend/components/file-tree/FileNode.tsx` - Nó da árvore

#### Hooks e Stores
- `frontend/hooks/useFileOperations.ts` - Operações com arquivos
- `frontend/hooks/useTaskEditor.ts` - Edição de tarefas
- `frontend/hooks/useMetadataEditor.ts` - Edição de metadados
- `frontend/stores/editor-store.ts` - Estado do editor

### **Modificações em Arquivos Existentes**

#### IPC Channels (backend/types/ipc.ts)
```typescript
export const IPC_CHANNELS = {
  // ... existentes
  SAVE_WORKSPACE: "save-workspace",
  CREATE_FILE: "create-file",
  DELETE_FILE: "delete-file", 
  RENAME_FILE: "rename-file",
  MOVE_FILE: "move-file",
  BACKUP_FILE: "backup-file",
  VALIDATE_METADATA: "validate-metadata",
} as const;
```

#### Main Process (backend/main.ts)
- Adicionar handlers para todas as operações de arquivo
- Implementar sistema de backup
- Adicionar validação de integridade

#### Workspace Types (backend/types/workspace.ts)
- Adicionar campos de tracking de mudanças
- Estender metadados com campos editáveis
- Adicionar tipos para operações de arquivo

### **Fluxo de Edição Completo**

#### 1. Usuário Edita Tarefa
```
UI → Store → IPC → Backend → File System → Response → Store → UI Update
```

#### 2. Salvamento de Arquivo
```
Store State → MdcSerializer → File Writer → Backup → Success/Error → UI Feedback
```

#### 3. Criação de Nova Tarefa
```
New Task Modal → Form Data → ID Generation → Phase Selection → Store Update → Auto Save
```

## 📋 Checklist de Implementação

### **Milestone 1: Edição Básica (Semana 1)**
- [ ] MdcSerializer implementado e testado
- [ ] Save IPC handlers funcionando
- [ ] Edição de tarefas básica (adicionar/editar/remover)
- [ ] Tracking de mudanças implementado
- [ ] Salvamento manual funcionando

### **Milestone 2: Interface Completa (Semana 2)**
- [ ] Modais de edição implementados
- [ ] Editor de metadados funcional
- [ ] Criação de novos arquivos
- [ ] Sistema de backup operacional
- [ ] Validação de dados implementada

### **Milestone 3: Produção Ready (Semana 3)**
- [ ] Reorganização de arquivos funcionando
- [ ] Interface polida e responsiva
- [ ] Tratamento de erros robusto
- [ ] Testes automatizados básicos
- [ ] Documentação atualizada

### **Milestone 4: Recursos Avançados (Semana 4)**
- [ ] Editor de conteúdo avançado
- [ ] Operações em lote
- [ ] Sistema de templates
- [ ] Preparação para IA integrada

## 🔧 Considerações Técnicas

### **Performance**
- Implementar debounce para auto-save
- Lazy loading para arquivos grandes
- Virtual scrolling para muitos arquivos
- Caching inteligente de parsing

### **Segurança**
- Validação rigorosa de inputs
- Sanitização de conteúdo markdown
- Backup antes de modificações críticas
- Verificação de integridade de arquivos

### **Usabilidade**
- Undo/Redo para todas operações
- Keyboard shortcuts padronizados
- Drag & drop intuitivo
- Feedback visual claro

### **Compatibilidade**
- Manter 100% compatibilidade com .mdc existentes
- Backward compatibility com versões antigas
- Suporte a diferentes estruturas de projeto
- Export para formatos padrão

## 🎯 Resultado Final Esperado

Ao final da implementação, o usuário poderá:

1. **Abrir qualquer projeto** com arquivos .mdc
2. **Visualizar em Dashboard ou Kanban** a estrutura atual
3. **Editar tarefas diretamente** na interface
4. **Adicionar novas tarefas** onde quiser
5. **Alterar metadados YAML** através de formulários
6. **Criar novos arquivos .mdc** com templates
7. **Reorganizar arquivos** e estruturas
8. **Salvar tudo de volta** mantendo compatibilidade
9. **Ter backup automático** de todas mudanças
10. **Interface preparada** para IA futura

O projeto será uma ferramenta completa de gestão de projetos baseada em .mdc, mantendo toda a compatibilidade com Cursor Rules enquanto adiciona capacidades poderosas de edição e organização.