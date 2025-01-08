import { createFileRoute } from '@tanstack/react-router';
import { RoomProvider } from '@/components/providers/RoomProvider';
import { GamePage } from '@/components/room/GamePage';

export const Route = createFileRoute('/room/$id')({
  component: RoomPage,
});

function RoomPage() {
  const { id } = Route.useParams();

  return (
    <RoomProvider roomId={id}>
      <div className="min-h-screen flex flex-col items-center justify-center">
        <GamePage />
      </div>
    </RoomProvider>
  );
}
