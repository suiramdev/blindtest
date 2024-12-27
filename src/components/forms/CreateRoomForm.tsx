import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { createRoom, joinRoom } from '@/utils/api/room';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export const createRoomSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
});

export type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export function CreateRoomForm() {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = async (values: CreateRoomFormValues) => {
    try {
      setLoading(true);

      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      const room = await createRoom();
      await joinRoom(room.room_id, values.username);

      navigate({ to: `/room/${room.room_id}` });
    } catch (error) {
      toast.error('Failed to create room');
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Create Room
        </Button>
      </form>
    </Form>
  );
}
