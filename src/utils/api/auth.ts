import { supabase } from '@/lib/supabase';

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error('Not authenticated');
  }

  return session;
}
