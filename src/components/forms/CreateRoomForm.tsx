import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { createRoom, joinRoom } from '@/utils/api/room';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreateRoomFormProps {
  username: string;
}

export function CreateRoomForm({ username }: CreateRoomFormProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useSession();

  const handleCreateGame = async () => {
    try {
      setLoading(true);

      // If the user is not signed in, sign them in anonymously
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      const room = await createRoom();
      await joinRoom(room.room_id, username);

      navigate({ to: `/room/${room.room_id}` });
    } catch (error) {
      toast.error('Failed to create room', {
        description: 'Please try again later.',
      });
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      onClick={handleCreateGame}
      disabled={loading || !username}
    >
      Create Room
    </Button>
  );
}
