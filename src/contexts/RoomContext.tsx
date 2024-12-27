import { createContext, ReactNode } from 'react';
import { Room, Player } from '@/utils/api/types';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface RoomContextValue {
  room?: Room | null;
  currentPlayer?: Player | null;
  players?: Player[];
  isLoading: boolean;
  isHost: boolean;
}

export const RoomContext = createContext<RoomContextValue>({
  isLoading: true,
  isHost: false,
});

interface RoomProviderProps {
  roomId: string;
  children: ReactNode;
}

export function RoomProvider({ roomId, children }: RoomProviderProps) {
  const { session } = useSession();

  // Query for room data
  const { data: room, isLoading: isRoomLoading } = useQuery<Room | null>({
    queryKey: [
      'room',
      {
        roomId,
      },
    ],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error) throw error;

      return data;
    },
    enabled: !!roomId,
  });

  // Query for current player data
  const { data: currentPlayer, isLoading: isPlayerLoading } =
    useQuery<Player | null>({
      queryKey: [
        'players',
        {
          roomId,
          userId: session?.user.id,
        },
      ],
      queryFn: async () => {
        if (!session) return null;

        console.log('session', session);

        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        return data;
      },
      enabled: !!roomId,
    });

  // Query for all players in the room
  const { data: players, isLoading: isPlayersLoading } = useQuery<Player[]>({
    queryKey: [
      'players',
      {
        roomId,
      },
    ],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId);

      if (error) throw error;

      return data;
    },
    enabled: !!roomId,
  });

  // Setup realtime subscriptions
  useRealtimeSubscription({
    table: 'rooms',
    invalidateQueries: [
      'room',
      {
        roomId,
      },
    ],
    filter: `room_id=eq.${roomId}`,
  });

  useRealtimeSubscription({
    table: 'players',
    invalidateQueries: [
      'players',
      {
        roomId,
      },
    ],
    filter: `room_id=eq.${roomId}`,
  });

  const isLoading = isRoomLoading || isPlayerLoading || isPlayersLoading;
  const isHost =
    !!room && !!currentPlayer && room.host_id === currentPlayer.user_id;

  return (
    <RoomContext.Provider
      value={{ room, currentPlayer, players, isLoading, isHost }}
    >
      {children}
    </RoomContext.Provider>
  );
}
