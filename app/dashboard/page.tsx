import { redirect } from "next/navigation";

export default function DashboardIndex() {
  // Vista Hoy is the product default.
  redirect("/dashboard/hoy");
}
