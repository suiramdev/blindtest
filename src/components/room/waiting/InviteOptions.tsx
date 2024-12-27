import { Button } from '@/components/ui/button';
import { Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteOptionsProps {
  roomId: string;
}

export function InviteOptions({ roomId }: InviteOptionsProps) {
  const copyRoomLink = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Room link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy room link');
      console.error('Failed to copy room link:', error);
    }
  };

  const shareRoom = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      if (navigator.share) {
        await navigator.share({
          title: 'Join my Blind Test game!',
          text: 'Click this link to join my music quiz game',
          url,
        });
      } else {
        await copyRoomLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Invite others</h3>
        <p className="text-sm text-muted-foreground">
          Share the game with your friends using one of these options:
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button variant="outline" onClick={copyRoomLink} className="gap-2">
          <Link2 className="h-4 w-4" />
          Copy Room Link
        </Button>
        <Button variant="outline" onClick={shareRoom} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Room
        </Button>
      </div>
    </div>
  );
}
