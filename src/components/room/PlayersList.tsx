import { Crown } from 'lucide-react';
import { PlayerActionsMenu } from './PlayerActionsMenu';
import { useRoom } from '@/hooks/useRoom';
import { cn } from '@/lib/utils';

export function PlayersList() {
  const { players, room, currentPlayer, isHost } = useRoom();

  return (
    <div className="flex flex-col space-y-2 w-full">
      <h2 className="text-lg font-semibold">Players</h2>
      <div className="flex flex-col space-y-2">
        {players?.map((player) => (
          <div
            key={player.player_id}
            className="flex items-center justify-between rounded-md border px-4 py-2 h-10 bg-card"
          >
            <div className="flex items-center space-x-2">
              {player.user_id === room?.host_id && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
              <span
                className={cn(
                  player.user_id === currentPlayer?.user_id && 'text-primary',
                  'text-sm font-medium',
                )}
              >
                {player.username}
              </span>
            </div>
            {currentPlayer?.user_id !== player.user_id && isHost && (
              <PlayerActionsMenu playerId={player.player_id} />
            )}
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground text-right">
        {players?.length ?? 0} players
      </span>
    </div>
  );
}
