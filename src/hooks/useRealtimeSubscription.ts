import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export interface UseRealtimeSubscriptionParams {
  table: string;
  invalidateQueries: unknown[];
  filter?: string;
}

export function useRealtimeSubscription({
  table,
  invalidateQueries,
  filter,
}: UseRealtimeSubscriptionParams) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Create subscription
      channel = supabase
        .channel(`public:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter,
          },
          () => {
            // Invalidate queries with the same filter/table
            queryClient.invalidateQueries({
              queryKey: invalidateQueries,
            });
          },
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, filter, queryClient]);
}
