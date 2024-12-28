import { useEffect, useState } from 'react';
import { Round } from '@/utils/api/types';
import { useRoom } from '@/hooks/useRoom';

interface RoundResultsProps {
  round: Round;
}

export function RoundResults({ round }: RoundResultsProps) {
  const { players } = useRoom();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Show results after 30 seconds
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [round.created_at]);

  if (!showResults) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Round Results</h3>
      <div className="text-sm">
        <p>Song: {round.song_name}</p>
        <p>Artist: {round.artist_name}</p>
      </div>

      <div className="space-y-2">
        {players?.map((player) => {
          const answer = round.answers?.[player.player_id];
          return (
            <div
              key={player.player_id}
              className="flex items-center justify-between rounded-md border px-4 py-2"
            >
              <span>{player.username}</span>
              <span>{answer?.score || 0} points</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
