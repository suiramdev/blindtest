import { Music2 } from 'lucide-react';
import { Round } from '@/utils/api/round';

interface AnswerResultsProps {
  round: Round;
}

export function AnswerResults({ round }: AnswerResultsProps) {
  // Get correct answers from the round
  const correctAnswers = Object.entries(round.answers || {})
    .filter(([, answer]) => answer.score > 0)
    .sort(
      (a, b) =>
        new Date(a[1].created_at).getTime() -
        new Date(b[1].created_at).getTime(),
    );

  if (correctAnswers.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Correct Answers
      </h3>
      <div className="flex flex-wrap gap-2">
        {correctAnswers.map(([playerId, answer]) => (
          <div
            key={playerId}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
          >
            <Music2 className="h-3.5 w-3.5" />
            <span>{answer.answer}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
