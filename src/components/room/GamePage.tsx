import { useRoom } from '@/hooks/useRoom';
import { PlayRoom } from './playing/PlayRoom';
import { WaitingRoom } from './waiting/WaitingRoom';

export function GamePage() {
  const { room, isLoading } = useRoom();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return room?.status === 'playing' ? <PlayRoom /> : <WaitingRoom />;
}
