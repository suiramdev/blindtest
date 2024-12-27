import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { joinRoom } from '@/utils/api/room';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useRoom } from '@/hooks/useRoom';

interface JoinRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { room } = useRoom();

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If the user is not signed in, sign them in anonymously
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      await joinRoom(room.room_id, username);

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

  return (
    <Dialog open={open}>
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>
            Enter your username to join the room.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !username}>
            Join Room
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
