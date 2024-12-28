import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRoom } from '@/hooks/useRoom';

interface AnswerInputProps {
  roundId: string;
}

export function AnswerInput({ roundId }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const { room, currentPlayer } = useRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !currentPlayer || !room) return;

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('submit-answer', {
        body: {
          roundId,
          answer,
          playerId: currentPlayer.player_id,
          roomCode: room.room_id,
        },
      });

      if (data.isCorrect) {
        toast.success(`Correct! You scored ${data.score} points!`);
      } else {
        toast.error('Wrong answer, try again!');
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter song name..."
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !answer}>
        Submit
      </Button>
    </form>
  );
}