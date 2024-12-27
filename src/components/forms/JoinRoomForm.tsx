import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { getRoom } from '@/utils/api/room';
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

export const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
});

export type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

export function JoinRoomForm() {
  const navigate = useNavigate();

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: '',
    },
  });

  const onSubmit = async (values: JoinRoomFormValues) => {
    // Check if room exists using the getRoom function
    const room = await getRoom(values.roomCode);
    if (!room) {
      form.setError('roomCode', {
        type: 'manual',
        message: 'Room not found',
      });
      return;
    }

    navigate({ to: `/room/${values.roomCode}` });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roomCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter room code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Join Room
        </Button>
      </form>
    </Form>
  );
}
