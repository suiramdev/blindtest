import { useRoom } from "@/hooks/use-room";
import { PlayRoom } from "./playing/play-room";
import { WaitingRoom } from "./waiting/waiting-room";

export function GamePage() {
  const { room, isLoading } = useRoom();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  return room.status === "playing" ? <PlayRoom /> : <WaitingRoom />;
}
