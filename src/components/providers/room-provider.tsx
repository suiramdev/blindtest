import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { getRoom, type Room, RoomSchema } from "@/utils/api/room";
import { type Player, PlayerSchema } from "@/utils/api/player";
import { type Round, RoundSchema } from "@/utils/api/round";
import { handleRealtimeUpdate } from "@/utils/realtime";
import { supabase } from "@/lib/supabase";
import { roomContext } from "@/contexts/room-context";
import { useSession } from "@/hooks/use-session";

export function RoomProvider({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  const { session } = useSession();

  const { data: initialRoom, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId),
  });

  const [room, setRoom] = useState<Room | null>(null);
  const { currentPlayer, latestRound, isHost } = useMemo<{
    currentPlayer: Player | null;
    latestRound: Round | null;
    isHost: boolean;
  }>(() => {
    const currentPlayer_ =
      room?.players?.find((player) => player.user_id === session?.user.id) ??
      null;

    return {
      currentPlayer: currentPlayer_,
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
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setRoom((current) => {
            if (!current) return current;
            return {
              ...current,
              ...RoomSchema.parse(payload.new),
            };
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Player>) => {
          setRoom((current) => {
            if (!current) return current;

            return {
              ...current,
              players: handleRealtimeUpdate<Player>(
                payload,
                "player_id",
                (data) => PlayerSchema.parse(data),
                current.players,
              ),
            };
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rounds",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Round>) => {
          setRoom((current) => {
            if (!current) return current;
            return {
              ...current,
              rounds: handleRealtimeUpdate<Round>(
                payload,
                "round_id",
                (data) => RoundSchema.parse(data),
                current.rounds,
              ),
            };
          });
        },
      )
      .subscribe();

    return () => {
      void roomChannel.unsubscribe();
    };
  }, [roomId, room?.rounds]);

  return (
    <roomContext.Provider
      value={{ room, currentPlayer, isHost, latestRound, isLoading }}
    >
      {children}
    </roomContext.Provider>
  );
}
