import { Crown } from 'lucide-react';
import { PlayerActionsMenu } from '../PlayerActionsMenu';
import { useRoom } from '@/hooks/useRoom';

export function PlayersList() {
  const { players, room, currentPlayer, isHost } = useRoom();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Players ({players?.length ?? 0})</h3>
      <div className="grid gap-2">
        {players?.map((player) => (
          <div
            key={player.player_id}
            className="flex items-center justify-between rounded-md border px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <span>{player.username}</span>
              {player.user_id === room?.host_id && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            {currentPlayer?.user_id !== player.user_id && isHost && (
              <PlayerActionsMenu playerId={player.player_id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
