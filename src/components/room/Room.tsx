import { useRoom } from '@/hooks/useRoom';
import { GameRoom } from './playing/GameRoom';
import { WaitingRoom } from './waiting/WaitingRoom';

export function Room() {
  const { room } = useRoom();

  // Show GameRoom if game has started, otherwise show WaitingRoom
  return room?.status === 'playing' ? <GameRoom /> : <WaitingRoom />;
}
