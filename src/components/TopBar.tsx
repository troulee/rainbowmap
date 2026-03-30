import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TopBarClient from "./TopBarClient";

export default async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <TopBarClient isLoggedIn={!!user} />;
}
