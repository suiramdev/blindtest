import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRoom } from '@/hooks/useRoom';
import { Round } from '@/utils/api/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useState } from 'react';

interface AnswerInputProps {
  round: Round;
}

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer'),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

export function AnswerInput({ round }: AnswerInputProps) {
  const { room, currentPlayer } = useRoom();
  const [shakeKey, setShakeKey] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isSubmitSuccessful },
    setError,
    reset,
  } = form;

  const onSubmit = async (values: AnswerFormValues) => {
    if (!currentPlayer || !room) return;

    try {
      const { data } = await supabase.functions.invoke('submit-answer', {
        body: {
          roundId: round.round_id,
          playerId: currentPlayer.player_id,
          answer: values.answer,
        },
      });

      if (data.isCorrect) {
        setScore(data.score);
        setTimeout(() => {
          reset();
        }, 2000);
      } else {
        setShakeKey((prev) => prev + 1);
        setError('answer', {
          type: 'manual',
          message: 'Wrong answer, try again!',
        });
        setTimeout(() => {
          form.clearErrors();
        }, 2000);
      }
    } catch (error) {
      setError('answer', {
        type: 'manual',
        message: 'Failed to submit answer',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <div className="relative" key={shakeKey}>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter song name..."
                    disabled={isSubmitting || isSubmitSuccessful}
                    className={cn(
                      'pr-24',
                      form.formState.errors.answer &&
                        'border-destructive animate-shake',
                      isSubmitSuccessful && 'border-green-500',
                    )}
                  />
                </FormControl>
                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitSuccessful}
                  className="absolute right-1 top-1 h-7"
                  size="sm"
                >
                  Submit
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {isSubmitSuccessful && score !== null && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="h-4 w-4" />
            <span>Correct answer! +{score} points</span>
          </div>
        )}
      </form>
    </Form>
  );
}
