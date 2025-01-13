import { MoreVertical, Crown, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { kickPlayer, promoteNewHost } from "@/utils/api/game";
import { type Player } from "@/utils/api/player";
import { type Game } from "@/utils/api/game";
import { cn } from "@/lib/utils";

interface PlayerActionsMenuProps {
  game: Game;
  player: Player;
}

export function PlayerActionsMenu({ game, player }: PlayerActionsMenuProps) {
  const isHost = game.host_id === player.user_id;

  const handlePromoteHost = async () => {
    try {
      await promoteNewHost(game.game_id, player.player_id);

      toast.success("Player promoted to host");
    } catch (error) {
      toast.error("Failed to promote player to host");
      console.error("Failed to promote player to host:", error);
    }
  };

  const handleKickPlayer = async () => {
    try {
      await kickPlayer(game.game_id, player.player_id);

      toast.success("Player kicked from game");
    } catch (error) {
      toast.error("Failed to kick player");
      console.error("Failed to kick player:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", isHost && "invisible")}
        >
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
