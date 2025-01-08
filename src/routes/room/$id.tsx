import { createFileRoute } from "@tanstack/react-router";
import { RoomProvider } from "@/components/providers/room-provider";
import { GamePage } from "@/components/room/game-page";

export const Route = createFileRoute("/room/$id")({
  component: RoomPage,
});

function RoomPage() {
  const { id } = Route.useParams();

  return (
    <RoomProvider roomId={id}>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <GamePage />
      </div>
    </RoomProvider>
  );
}
