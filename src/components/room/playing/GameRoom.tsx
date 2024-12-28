import { useEffect, useState } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PlayersList } from '../waiting/PlayersList';
import { Round } from '@/utils/api/types';
import { RoundTimer } from './RoundTimer';
import { AnswerInput } from './AnswerInput';
import { RoundResults } from './RoundResults';

export function GameRoom() {
  const { room } = useRoom();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Query current round using room.current_round_id
  const { data: currentRound } = useQuery<Round>({
    queryKey: ['round', room?.current_round_id],
    queryFn: async () => {
      if (!room?.current_round_id) throw new Error('No current round');

      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('round_id', room.current_round_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!room?.current_round_id,
  });

  // Effect to handle audio playback
  useEffect(() => {
    if (currentRound?.track.preview_url && !isPlaying) {
      const loadAndPlayAudio = async () => {
        try {
          const audioElement = new Audio(currentRound.track.preview_url);
          setAudio(audioElement);
          await audioElement.play();
          setIsPlaying(true);

          // Stop after 30 seconds
          setTimeout(() => {
            audioElement.pause();
            setIsPlaying(false);
            setAudio(null);
          }, 30000);
        } catch (error) {
          toast.error('Failed to play audio');
          console.error('Failed to play audio:', error);
        }
      };

      loadAndPlayAudio();
    }

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause();
        setIsPlaying(false);
        setAudio(null);
      }
    };
  }, [currentRound?.track.preview_url]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col gap-8 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Game Room</h2>
          {currentRound && <RoundTimer startTime={currentRound.created_at} />}
        </div>

        <div className="flex flex-col gap-4">
          <PlayersList />

          {currentRound && (
            <>
              <AnswerInput round={currentRound} />
              <RoundResults round={currentRound} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
