import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carica un arcobaleno | RainbowMap",
  description: "Condividi la tua foto di arcobaleno con il mondo",
};

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/upload");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-4">
      <h1 className="text-2xl font-extrabold text-on-surface tracking-tight mb-1">
        Cattura il momento
      </h1>
      <p className="text-sm text-on-surface-variant mb-8">
        Condividi la tua scoperta atmosferica con il mondo.
      </p>
      <UploadForm userId={user.id} />
    </div>
  );
}
