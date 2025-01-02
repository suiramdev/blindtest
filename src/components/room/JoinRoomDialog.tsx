import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { joinRoom } from '@/utils/api/room';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useRoom } from '@/hooks/useRoom';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

const joinRoomSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { room } = useRoom();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      username: '',
    },
  });

  if (!room) return null;

  const onSubmit = async (values: JoinRoomFormValues) => {
    setLoading(true);

    try {
      // If the user is not signed in, sign them in anonymously
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      await joinRoom(room.room_id, values.username);

      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to join room', {
        description: 'Please try again later.',
      });
      console.error('Failed to join room:', error);
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Username" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" loading={loading}>
          Join Room
        </Button>
      </form>
    </Form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>
              Enter your username to join the room.
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Join Room</DrawerTitle>
          <DrawerDescription>
            Enter your username to join the room.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
