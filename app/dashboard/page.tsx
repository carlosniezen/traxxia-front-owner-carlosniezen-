import { redirect } from "next/navigation";

export default function DashboardIndex() {
  // Vista Hoy is the product default; it lands in Phase 2. Until then, the
  // Norte (the only fully-built view in Phase 1) is the entry point.
  redirect("/dashboard/norte");
}
