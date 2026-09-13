import { redirect } from "next/navigation";
import { isMerchantAuthed } from "@/lib/auth";

export default async function AdminIndex() {
  if (await isMerchantAuthed()) redirect("/admin/orders");
  redirect("/admin/login");
}
