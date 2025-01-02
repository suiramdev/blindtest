import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlayersList } from '../PlayersList';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { LogOut, Play, Copy, Share2 } from 'lucide-react';
import { PlaylistSearch } from './PlaylistSearch';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { startRound, leaveRoom } from '@/utils/api/room';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { JoinRoomDialog } from '../JoinRoomDialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const waitingRoomSchema = z.object({
  playlistId: z.string().min(1, 'Please select a playlist'),
});

type WaitingRoomForm = z.infer<typeof waitingRoomSchema>;

export function WaitingRoom() {
  const { room, currentPlayer, isHost, isLoading } = useRoom();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm<WaitingRoomForm>({
    resolver: zodResolver(waitingRoomSchema),
    defaultValues: {
      playlistId: '',
    },
  });

  useEffect(() => {
    if (!isLoading && !currentPlayer) {
      setJoinDialogOpen(true);
    }
  }, [currentPlayer, isLoading]);

  const onSubmit = async (values: WaitingRoomForm) => {
    if (!room) return;

    try {
      await startRound(room.room_id, values.playlistId);
    } catch (error) {
      toast.error('Failed to start round');
      console.error(error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;

    try {
      await leaveRoom(room.room_id);

      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to leave room');
      console.error(error);
    }
  };

  const inviteLink = `${window.location.origin}/room/${room?.room_id}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const shareInviteLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my Blind Test game!',
          text: 'Click this link to join my music quiz game:',
          url: inviteLink,
        });
      } else {
        await copyInviteLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!room) {
    return <div>Room not found</div>;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full md:max-w-xl">
      <h1 className="py-8 text-4xl font-bold">Waiting for host...</h1>
      <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:flex-1 max-md:w-full max-md:rounded-b-none max-md:shadow-none">
        <div className="flex flex-col space-y-4">
          <PlayersList />
          <div className="flex flex-col space-y-2">
            <h2 className="text-lg font-semibold">Invite link</h2>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="flex-1" />
              <Button
                variant="secondary"
                size="icon"
                onClick={copyInviteLink}
                title="Copy invite link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={shareInviteLink}
                title="Share invite link"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="flex w-full flex-col space-y-2">
              {isHost && (
                <FormField
                  control={form.control}
                  name="playlistId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <PlaylistSearch
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="flex w-full gap-2">
                {isHost && (
                  <Button type="submit" className="flex-1">
                    <Play className="h-4 w-4" />
                    Start Game
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={cn(!isHost && 'flex-1')}
                  onClick={handleLeaveRoom}
                >
                  <LogOut className="h-4 w-4" />
                  Leave Room
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>
      <JoinRoomDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </div>
  );
}
