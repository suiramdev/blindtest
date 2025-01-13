import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  return session;
}
