import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function AnnouncementBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return null;

  return (
    <div className="border-b border-sa-gold/25 bg-gradient-to-r from-sa-green/10 via-sa-gold/10 to-sa-green/10">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 text-center text-xs sm:text-sm">
        <span className="text-slate-700">
          <span className="font-semibold text-sa-blue">Business owners:</span> Get leads
          in your inbox —
        </span>
        <Link
          href="/register"
          className="font-semibold text-sa-green transition-colors hover:text-sa-green/80 hover:underline"
        >
          List free →
        </Link>
      </div>
    </div>
  );
}
