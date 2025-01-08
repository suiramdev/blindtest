import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRoom } from '@/hooks/useRoom';
import { Round } from '@/utils/api/round';
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
import { AnswerResults } from './AnswerResults';

interface AnswerInputProps {
  round: Round;
}

const answerSchema = z.object({
  answer: z.string().min(1, 'Please enter an answer'),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

export function AnswerForm({ round }: AnswerInputProps) {
  const { room, currentPlayer } = useRoom();
  const [shakeKey, setShakeKey] = useState(0);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setError,
    reset,
  } = form;

  const onSubmit = async (values: AnswerFormValues) => {
    if (!currentPlayer || !room) return;

    try {
      const { data, error } = await supabase.functions.invoke('submit-answer', {
        body: {
          roundId: round.round_id,
          playerId: currentPlayer.player_id,
          answer: values.answer,
        },
      });

      if (error) throw error;

      if (!data.success) {
        setShakeKey((prev) => prev + 1);
        form.setError('answer', {
          type: 'manual',
          message: 'Wrong answer, try again!',
        });
      }

      reset(
        {
          answer: '',
        },
        {
          keepDirty: true,
          keepErrors: true,
        },
      );
    } catch (error) {
      setError('answer', {
        type: 'manual',
        message: 'Failed to submit answer',
      });
      console.error('Failed to submit answer:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnswerResults round={round} />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2" key={shakeKey}>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter song name or artist..."
                    disabled={isSubmitting}
                    className={cn(
                      'h-10',
                      form.formState.errors.answer &&
                        'border-destructive animate-shake',
                    )}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-4 w-4" />
                  Validate
                </Button>
              </div>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
