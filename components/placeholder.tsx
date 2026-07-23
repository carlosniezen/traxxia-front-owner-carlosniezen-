import { Construction } from "lucide-react";

export function Placeholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="animate-fade-in">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {phase}
      </p>
      <h1 className="text-4xl font-light">{title}</h1>
      <p className="mt-4 max-w-lg text-secondary">{description}</p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
        <Construction className="h-4 w-4 text-amber" />
        Esta vista llega en una fase posterior del MVP.
      </div>
    </div>
  );
}
