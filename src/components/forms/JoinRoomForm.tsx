import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { joinRoom } from '@/utils/api/room';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

interface JoinRoomFormProps {
  username: string;
}

export function JoinRoomForm({ username }: JoinRoomFormProps) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: '',
    },
  });

  const onSubmit = async (values: JoinRoomFormValues) => {
    try {
      setLoading(true);

      // If the user is not signed in, sign them in anonymously
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      const player = await joinRoom(values.roomCode, username);

      navigate({ to: `/room/${player.room_id}` });
    } catch (error) {
      toast.error('Failed to join room', {
        description: 'Please try again later.',
      });
      console.error('Failed to join room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full gap-2">
      <Input
        placeholder="Room Code"
        {...form.register('roomCode')}
        aria-invalid={!!form.formState.errors.roomCode}
      />
      <Button
        type="submit"
        disabled={loading || !username || !form.formState.isValid}
      >
        Join
      </Button>
    </form>
  );
}
