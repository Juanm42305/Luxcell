"use server";

import { redirect } from "next/navigation";
import { adminHref } from "@/lib/admin-path";
import { createSessionClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect(adminHref("/login"));
}
