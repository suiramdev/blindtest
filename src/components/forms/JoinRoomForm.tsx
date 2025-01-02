import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from '@tanstack/react-router';
import { getRoom, joinRoom } from '@/utils/api/room';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';

export const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

interface JoinRoomFormProps {
  className?: string;
}

export function JoinRoomForm({ className }: JoinRoomFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: '',
    },
  });

  const onSubmit = async (values: JoinRoomFormValues) => {
    try {
      setLoading(true);

      // Check if room exists using the getRoom function
      const room = await getRoom(values.roomCode);
      if (!room) {
        form.setError('roomCode', {
          type: 'manual',
          message: 'Room not found',
        });
        return;
      }

      // Sign in anonymously if not already signed in
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        await supabase.auth.signInAnonymously();
      }

      // Join the room
      await joinRoom(values.roomCode, 'Anonymous');

      navigate({ to: `/room/${values.roomCode}` });
    } catch (error) {
      toast.error('Failed to join room');
      console.error('Failed to join room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6 w-full', className)}
      >
        <FormField
          control={form.control}
          name="roomCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Room Code"
                  className="text-center"
                  variant="outline"
                  size="lg"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Join the Room
          <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
}
