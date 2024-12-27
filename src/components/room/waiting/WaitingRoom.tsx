import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RoomSettingsDialog } from './RoomSettingsDialog';
import { PlayersList } from './PlayersList';
import { InviteOptions } from './InviteOptions';
import { useRoom } from '@/hooks/useRoom';
import { JoinRoomDialog } from '../JoinRoomDialog';
import { useNavigate } from '@tanstack/react-router';
import { leaveRoom } from '@/utils/api/room';

export function WaitingRoom() {
  const { room, currentPlayer, isLoading, isHost } = useRoom();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentPlayer) {
      setJoinDialogOpen(true);
    }
  }, [currentPlayer, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found</div>;
  }

  const handleStartGame = async () => {
    if (!room.playlist_id) {
      toast.error('Please select a playlist first');
      return;
    }

    try {
      setLoading(true);
      // Add start game logic
    } catch (error) {
      toast.error('Failed to start game');
      console.error('Failed to start game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(room.room_id);
      navigate({ to: '/' });
    } catch (error) {
      toast.error('Failed to leave room');
      console.error('Failed to leave room:', error);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 rounded-lg border p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Waiting Room</h2>
        {isHost && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <RoomSettingsDialog
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
          </>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <PlayersList />
        <InviteOptions roomId={room.room_id} />
        <div className="flex gap-2">
          {isHost ? (
            <Button
              onClick={handleStartGame}
              disabled={loading || !room.playlist_id}
              className="flex-1"
            >
              Start Game
            </Button>
          ) : (
            <Button disabled className="flex-1">
              Waiting for host to start...
            </Button>
          )}
          <Button variant="outline" onClick={handleLeaveRoom} className="gap-2">
            <LogOut className="h-4 w-4" />
            Leave Room
          </Button>
        </div>
      </div>
      <JoinRoomDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </div>
  );
}
