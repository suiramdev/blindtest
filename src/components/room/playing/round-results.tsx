import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { type Room, startRound } from "@/utils/api/room";
import { type Round } from "@/utils/api/round";

interface RoundResultsProps {
  room: Room;
  round: Round;
}

export function RoundResults({ room, round }: RoundResultsProps) {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const isHost = room.host_id === session?.user.id;

  const handleNextRound = async () => {
    if (!room.playlist_id) return;

    try {
      setLoading(true);
      await startRound(room.room_id, room.playlist_id);
    } catch (error) {
      toast.error("Failed to start next round");
      console.error("Failed to start next round", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTrack = round.track;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <img
          src={currentTrack.album.images[0]?.url}
          alt={currentTrack.album.name}
          className="h-16 w-16 animate-spin rounded-full [animation-duration:3s]"
        />
        <div>
          <h3 className="text-lg font-semibold">{currentTrack.name}</h3>
          <p className="text-muted-foreground">
            {currentTrack.artists.map((artist) => artist.name).join(", ")}
          </p>
        </div>
      </div>
      <Button
        onClick={handleNextRound}
        size="lg"
        className="w-full"
        disabled={!isHost}
        loading={loading}
      >
        {isHost ? "Next Round" : "Waiting for host..."}
      </Button>
    </div>
  );
}
