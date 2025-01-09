import { useMemo } from "react";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGame } from "@/hooks/use-game";
import { ProfilerProvider } from "../providers/profiler-provider";
import { PlayerActionsMenu } from "./player-actions-menu";

export function PlayersList() {
  const { game, players, me, playerPresence } = useGame();

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  if (!game) return null;

  return (
    <ProfilerProvider id="PlayersList">
      <div className="flex w-full flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Players</h2>
          <span className="text-sm text-muted-foreground">
            {players.length} {players.length === 1 ? "player" : "players"}
          </span>
        </div>
        <div className="grid gap-2">
          {sortedPlayers.map((otherPlayer) => (
            <div
              key={otherPlayer.player_id}
              className={cn(
                "group relative flex h-14 items-center justify-between rounded-lg border bg-card p-4",
                otherPlayer.user_id === me?.user_id &&
                  "border-primary/50 bg-accent/20",
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full transition-colors",
                    playerPresence[otherPlayer.player_id]?.online
                      ? "bg-green-500 shadow-sm shadow-green-500/50"
                      : "bg-gray-300",
                  )}
                />
                <div className="flex items-center space-x-2">
                  {otherPlayer.user_id === game.host_id && (
                    <Crown className="h-4 w-4 text-yellow-500 drop-shadow-sm" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      otherPlayer.user_id === me?.user_id && "text-primary",
                      otherPlayer.user_id === game.host_id && "font-semibold",
                    )}
                  >
                    {otherPlayer.username}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {game.status === "playing" && (
                  <div className="flex items-center">
                    <span className="font-semibold tabular-nums">
                      {otherPlayer.score}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      pts
                    </span>
                  </div>
                )}
                {me?.user_id === game.host_id && (
                  <PlayerActionsMenu game={game} player={otherPlayer} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProfilerProvider>
  );
}
