import { redirect } from "next/navigation";
import { destroySession } from "@/lib/auth";

export default async function LogoutPage() {
  await destroySession();
  redirect("/");
}
