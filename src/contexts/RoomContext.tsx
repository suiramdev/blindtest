import { createContext, ReactNode } from 'react';
import { Room, Player } from '@/utils/api/types';
import { useSession } from '@/hooks/useSession';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface RoomContextValue {
  room: Room | null;
  currentPlayer: Player | null;
  players: Player[];
  isLoading: boolean;
  isHost: boolean;
}

export const RoomContext = createContext<RoomContextValue>({
  room: null,
  currentPlayer: null,
  players: [],
  isLoading: true,
  isHost: false,
});

interface RoomProviderProps {
  room: Room;
  children: ReactNode;
}

export function RoomProvider({ room, children }: RoomProviderProps) {
  const { session } = useSession();

  // Query for current player data
  const { data: currentPlayer, isLoading: isPlayerLoading } =
    useQuery<Player | null>({
      queryKey: [
        'players',
        { roomId: room?.room_id, userId: session?.user.id },
      ],
      queryFn: async () => {
        if (!session) return null;
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', room.room_id)
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        return data;
      },
      enabled: !!room.room_id,
    });

  // Query for all players in the room
  const { data: players, isLoading: isPlayersLoading } = useQuery<Player[]>({
    queryKey: ['players', { roomId: room.room_id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.room_id);

      if (error) throw error;
      return data;
    },
    enabled: !!room.room_id,
  });

  // Setup realtime subscriptions
  useRealtimeSubscription({
    table: 'rooms',
    invalidateQueries: [
      'room',
      {
        roomId: room.room_id,
      },
    ],
    filter: `room_id=eq.${room.room_id}`,
  });

  useRealtimeSubscription({
    table: 'players',
    invalidateQueries: [
      'players',
      {
        roomId: room.room_id,
      },
    ],
    filter: `room_id=eq.${room.room_id}`,
  });

  const isLoading = isPlayerLoading || isPlayersLoading;
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
