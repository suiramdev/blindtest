import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRoom, Room, RoomSchema } from '@/utils/api/room';
import { Player, PlayerSchema } from '@/utils/api/player';
import { Round, RoundSchema } from '@/utils/api/round';
import { supabase } from '@/lib/supabase';
import { roomContext } from '@/contexts/RoomContext';
import { useSession } from '@/hooks/useSession';

export function RoomProvider({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId: string;
}) {
  const { session } = useSession();

  const { data: initialRoom, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId),
  });

  const [room, setRoom] = useState<Room | null>(null);
  const { currentPlayer, latestRound, isHost } = useMemo<{
    currentPlayer: Player | null;
    latestRound: Round | null;
    isHost: boolean;
  }>(() => {
    const currentPlayer =
      room?.players?.find((player) => player.user_id === session?.user.id) ??
      null;

    return {
      currentPlayer,
      latestRound:
        room?.rounds?.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0] ?? null,
      isHost: room?.host_id === session?.user.id,
    };
  }, [room, session]);

  // Initialize room state when initial data is loaded
  useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
    }
  }, [initialRoom]);

  useEffect(() => {
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          // Update room properties without touching players/rounds
          setRoom(
            (current) =>
              current && {
                ...current,
                ...RoomSchema.parse(payload.new),
                players: current.players || [],
                rounds: current.rounds || [],
              },
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setRoom((current) => {
            if (!current) return current;

            const player = PlayerSchema.parse(payload.new);
            let updatedPlayers = current.players || [];

            if (payload.eventType === 'DELETE') {
              updatedPlayers = updatedPlayers.filter(
                (p) => p.player_id !== payload.old.player_id,
              );
            } else if (payload.eventType === 'INSERT') {
              updatedPlayers = [...updatedPlayers, player];
            } else {
              // UPDATE
              updatedPlayers = updatedPlayers.map((p) =>
                p.player_id === player.player_id ? player : p,
              );
            }

            return {
              ...current,
              players: updatedPlayers,
            };
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setRoom((current) => {
            if (!current) return current;

            const round = RoundSchema.parse(payload.new);
            let updatedRounds = current.rounds || [];

            if (payload.eventType === 'DELETE') {
              updatedRounds = updatedRounds.filter(
                (r) => r.round_id !== payload.old.round_id,
              );
            } else if (payload.eventType === 'INSERT') {
              updatedRounds = [...updatedRounds, round];
            } else {
              // UPDATE
              updatedRounds = updatedRounds.map((r) =>
                r.round_id === round.round_id ? round : r,
              );
            }

            return {
              ...current,
              rounds: updatedRounds,
            };
          });
        },
      )
      .subscribe();

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  return (
    <roomContext.Provider
      value={{ room, currentPlayer, isHost, latestRound, isLoading }}
    >
      {children}
    </roomContext.Provider>
  );
}
