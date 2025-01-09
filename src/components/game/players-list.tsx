import { useMemo } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGame } from "@/hooks/use-game";
import { ProfilerProvider } from "../providers/profiler-provider";
import { PlayerActionsMenu } from "./player-actions-menu";

export function PlayersList() {
  const { game, players, me } = useGame();

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  if (!game) return null;

  return (
    <ProfilerProvider id="PlayersList">
      <div className="flex w-full flex-col space-y-2">
        <h2 className="text-lg font-semibold">Players</h2>
        <div className="flex flex-col space-y-2">
          {sortedPlayers.map((otherPlayer) => (
            <div
              key={otherPlayer.player_id}
              className="flex h-10 items-center justify-between rounded-md border bg-card px-4 py-2"
            >
              <div className="flex items-center space-x-2">
                {otherPlayer.user_id === game.host_id && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                <span
                  className={cn(
                    otherPlayer.user_id === me?.user_id && "text-primary",
                    "text-sm font-medium",
                  )}
                >
                  {otherPlayer.username}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {game.status === "playing" && (
                  <span className="text-right font-medium">
                    {otherPlayer.score}
                    <span className="text-xs text-muted-foreground"> pts</span>
                  </span>
                )}
                {me?.user_id === game.host_id && (
                  <PlayerActionsMenu game={game} player={otherPlayer} />
                )}
              </div>
            </div>
          ))}
        </div>
        <span className="text-right text-xs text-muted-foreground">
          {players.length} players
        </span>
      </div>
    </ProfilerProvider>
  );
}
