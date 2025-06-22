import { ProjectSelector } from "../components/ProjectSelector";

export default function HomePage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Cursor TaskFlow</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie seus arquivos .mdc em uma interface Kanban
        </p>
      </div>

      <ProjectSelector />
    </main>
  );
}
