import { MoreVertical, Crown, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { kickPlayer, promoteNewHost } from '@/utils/api/room';
import { useRoom } from '@/hooks/useRoom';

interface PlayerActionsMenuProps {
  playerId: string;
}

export function PlayerActionsMenu({ playerId }: PlayerActionsMenuProps) {
  const { room } = useRoom();

  if (!room) return null;

  const handlePromoteHost = async () => {
    try {
      await promoteNewHost(room.room_id, playerId);

      toast.success('Player promoted to host');
    } catch (error) {
      toast.error('Failed to promote player to host');
      console.error('Failed to promote player to host:', error);
    }
  };

  const handleKickPlayer = async () => {
    try {
      await kickPlayer(room.room_id, playerId);

      toast.success('Player kicked from room');
    } catch (error) {
      toast.error('Failed to kick player');
      console.error('Failed to kick player:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePromoteHost}>
          <Crown className="mr-2 h-4 w-4" />
          Promote to Host
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleKickPlayer}
          className="text-destructive"
        >
          <UserX className="mr-2 h-4 w-4" />
          Kick Player
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
