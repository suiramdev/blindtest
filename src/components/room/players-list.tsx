import { Crown } from "lucide-react";
import { useRoom } from "@/hooks/use-room";
import { cn } from "@/lib/utils";
import { PlayerActionsMenu } from "./player-actions-menu";

export function PlayersList() {
  const { room, currentPlayer, isHost } = useRoom();

  return (
    <div className="flex w-full flex-col space-y-2">
      <h2 className="text-lg font-semibold">Players</h2>
      <div className="flex flex-col space-y-2">
        {room?.players
          ?.sort((a, b) => b.score - a.score)
          .map((player) => (
            <div
              key={player.player_id}
              className="flex h-10 items-center justify-between rounded-md border bg-card px-4 py-2"
            >
              <div className="flex items-center space-x-2">
                {player.user_id === room.host_id && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                <span
                  className={cn(
                    player.user_id === currentPlayer?.user_id && "text-primary",
                    "text-sm font-medium",
                  )}
                >
                  {player.username}
                </span>
              </div>
              <span className="text-right font-medium">
                {player.score}
                <span className="text-xs text-muted-foreground"> pts</span>
              </span>
              {currentPlayer?.user_id !== player.user_id && isHost ? (
                <PlayerActionsMenu playerId={player.player_id} />
              ) : null}
            </div>
          ))}
      </div>
      <span className="text-right text-xs text-muted-foreground">
        {room?.players?.length ?? 0} players
      </span>
    </div>
  );
}
