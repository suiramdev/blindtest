import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { PlayersList } from '../PlayersList';
import { AnswerForm } from './AnswerForm';
import { RoundTimer } from './RoundTimer';
import { RoundResults } from './RoundResults';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';

const ROUND_DURATION = 30; // seconds

function getTimeElapsed(startTime: string | Date): number {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / 1000);
}

export function PlayRoom() {
  const { room, latestRound } = useRoom();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const isRoundOver =
    latestRound && getTimeElapsed(latestRound.start_time) >= ROUND_DURATION;

  useEffect(() => {
    let audioElement: HTMLAudioElement | null = null;

    const playAudio = async () => {
      if (!latestRound?.track.preview_url || isRoundOver) {
        return;
      }

      try {
        const elapsed = getTimeElapsed(latestRound.start_time);
        if (elapsed >= ROUND_DURATION) {
          return;
        }

        audioElement = new Audio(latestRound.track.preview_url);
        setAudio(audioElement);

        // Set the current time proportionally to match the preview duration
        audioElement.currentTime = elapsed * (30 / ROUND_DURATION);
        await audioElement.play();
        setNeedsUserInteraction(false);

        // Schedule audio stop
        const remainingTime = Math.max(ROUND_DURATION - elapsed, 0) * 1000;
        setTimeout(() => {
          audioElement?.pause();
          setAudio(null);
        }, remainingTime);
      } catch (error) {
        if (error instanceof Error && error.name === 'NotAllowedError') {
          setNeedsUserInteraction(true);
        } else {
          toast.error('Failed to play audio');
          console.error('Failed to play audio:', error);
        }
      }
    };

    playAudio();

    // Cleanup function
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        setAudio(null);
      }
    };
  }, [latestRound, isRoundOver]);

  if (!room) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full md:max-w-xl">
      <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:flex-1 max-md:w-full max-md:rounded-none max-md:shadow-none max-md:border-none">
        <PlayersList />
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-4">
            {latestRound && <RoundTimer startTime={latestRound.created_at} />}
          </div>
          {needsUserInteraction ? (
            <Button
              onClick={() => {
                setNeedsUserInteraction(false);
                if (audio) {
                  audio.play().catch(() => setNeedsUserInteraction(true));
                }
              }}
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Game
            </Button>
          ) : (
            latestRound &&
            (isRoundOver ? (
              <RoundResults room={room} round={latestRound} />
            ) : (
              <AnswerForm round={latestRound} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
