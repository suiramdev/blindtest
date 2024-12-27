import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlaylistSearch } from './PlaylistSearch';
import { useState } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface RoomSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomSettingsDialog({
  open,
  onOpenChange,
}: RoomSettingsDialogProps) {
  const { room } = useRoom();
  const [playlistId, setPlaylistId] = useState(room?.playlist_id ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!room) return;

    setLoading(true);

    await supabase
      .from('rooms')
      .update({
        playlist_id: playlistId,
      })
      .eq('room_id', room.room_id);

    toast.success('Room settings saved');
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Spotify Playlist</label>
            <PlaylistSearch value={playlistId} onChange={setPlaylistId} />
          </div>
          <Button onClick={handleSave} loading={loading}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
