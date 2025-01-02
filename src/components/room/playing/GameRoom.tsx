import { useEffect, useState } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { PlayersList } from '../PlayersList';
import { Round } from '@/utils/api/types';
import { AnswerInput } from './AnswerInput';
import { RoundTimer } from './RoundTimer';

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
          // Check if round has ended (30s elapsed since start)
          const startTime = new Date(currentRound.created_at).getTime();
          const now = new Date().getTime();
          const elapsed = Math.floor((now - startTime) / 1000);

          if (elapsed >= 30) {
            return; // Don't play if round has ended
          }

          const audioElement = new Audio(currentRound.track.preview_url);
          setAudio(audioElement);

          // Set current time to elapsed time in the preview
          const previewElapsed = elapsed * (30 / 30); // Scale elapsed time to preview duration
          audioElement.currentTime = previewElapsed;

          await audioElement.play();
          setIsPlaying(true);

          // Stop after remaining time
          const remainingTime = Math.max(30 - elapsed, 0) * 1000;
          setTimeout(() => {
            audioElement.pause();
            setIsPlaying(false);
            setAudio(null);
          }, remainingTime);
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
  }, [currentRound?.created_at]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full md:max-w-xl">
      <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:flex-1 max-md:w-full max-md:rounded-none max-md:shadow-none max-md:border-none">
        <PlayersList />
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-4">
            {currentRound && <RoundTimer startTime={currentRound.created_at} />}
          </div>
          {currentRound && <AnswerInput round={currentRound} />}
        </div>
      </Card>
    </div>
  );
}
