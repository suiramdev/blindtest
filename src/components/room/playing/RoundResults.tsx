import { useEffect, useState } from 'react';
import { Round } from '@/utils/api/types';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface RoundResultsProps {
  round: Round;
}

export function RoundResults({ round }: RoundResultsProps) {
  const { players, isHost, room } = useRoom();
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show results after 30 seconds
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [round.created_at]);

  const startNewRound = async () => {
    if (!room?.playlist_id) return;

    setLoading(true);
    try {
      await supabase.functions.invoke('start-round', {
        body: { roomId: room.room_id, playlistId: room.playlist_id },
      });
    } catch (error) {
      toast.error('Failed to start round');
      console.error('Failed to start round:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showResults) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Round Results</h3>
      <div className="text-sm">
        <p>Song: {round.track.name}</p>
        <p>
          Artists: {round.track.artists.map((artist) => artist.name).join(', ')}
        </p>
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

      {isHost && (
        <Button onClick={startNewRound} disabled={loading} className="w-full">
          Next Round
        </Button>
      )}
    </div>
  );
}
