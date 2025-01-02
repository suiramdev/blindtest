import { createFileRoute } from '@tanstack/react-router';
import { RoomProvider } from '@/contexts/RoomContext';
import { supabase } from '@/lib/supabase';
import { Room } from '@/utils/api/types';
import { GameRoom } from '@/components/room/playing/GameRoom';
import { WaitingRoom } from '@/components/room/waiting/WaitingRoom';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/room/$id')({
  component: RoomPage,
  loader: async ({ params: { id: roomId } }) => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error) throw error;

    return data as Room | null;
  },
});

function RoomPage() {
  const initialRoom = Route.useLoaderData();
  const [room, setRoom] = useState<Room | null>(initialRoom);
  const { id: roomId } = Route.useParams();

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
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
          setRoom(payload.new as Room);
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (!room) {
    return <div>Room not found</div>;
  }

  return (
    <RoomProvider room={room}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        {room.status === 'playing' ? <GameRoom /> : <WaitingRoom />}
      </div>
    </RoomProvider>
  );
}
