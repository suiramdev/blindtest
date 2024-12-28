import { createFileRoute } from '@tanstack/react-router';
import { RoomProvider } from '@/contexts/RoomContext';
import { Room } from '@/components/room/Room';

export const Route = createFileRoute('/room/$id')({
  component: RoomPage,
});

function RoomPage() {
  const { id: roomId } = Route.useParams();

  return (
    <RoomProvider roomId={roomId}>
      <Room />
    </RoomProvider>
  );
}
