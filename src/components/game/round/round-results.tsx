import { useState } from "react";
import { toast } from "sonner";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useGame } from "@/hooks/use-game";
import { startRound } from "@/utils/api/game";

export function RoundResults() {
  const { game, round } = useGame();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!game || !round) return null;

  const isHost = game.host_id === session?.user.id;

  const handleNextRound = async () => {
    if (!game.playlist_id) return;

    try {
      setLoading(true);
      await startRound(game.game_id, game.playlist_id);
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
        {isHost ? (
          <>
            <PlayIcon className="h-4 w-4" />
            Play Next Round
          </>
        ) : (
          "Waiting for host..."
        )}
      </Button>
    </div>
  );
}
