import { createFileRoute } from '@tanstack/react-router';
import { WaitingRoom } from '@/components/room/waiting/WaitingRoom';
import { RoomProvider } from '@/contexts/RoomContext';

export const Route = createFileRoute('/room/$id')({
  component: RoomPage,
});

function RoomPage() {
  const { id: roomId } = Route.useParams();

  return (
    <RoomProvider roomId={roomId}>
      <div className="flex flex-1 items-center justify-center">
        <WaitingRoom />
      </div>
    </RoomProvider>
  );
}
