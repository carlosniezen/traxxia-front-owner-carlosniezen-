import { getDimension } from "@/lib/dimensions";
import { cn } from "@/lib/utils";

/** A small colored chip for a dimension id (e.g. "S", "T1"). */
export function DimensionChip({
  id,
  size = "sm",
  showName = true,
  className,
}: {
  id: string;
  size?: "sm" | "xs";
  showName?: boolean;
  className?: string;
}) {
  const dim = getDimension(id);
  if (!dim) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border",
        size === "xs" ? "px-2 py-0.5 text-[0.7rem]" : "px-2.5 py-1 text-xs",
        "text-secondary",
        className,
      )}
      title={`${dim.nameEs} — ${dim.blurbEs}`}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: dim.color }}
      />
      {showName ? dim.nameEs : dim.letter}
    </span>
  );
}
