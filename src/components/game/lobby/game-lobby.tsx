import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOut, Play, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { PlayersList } from "../players-list";
import { PlaylistSearch } from "./playlist-search";

const gameLobbySchema = z.object({
  playlistId: z.string().min(1, "Please select a playlist"),
});

type GameLobbyForm = z.infer<typeof gameLobbySchema>;

export function GameLobby() {
  const { game, me, startRound, leaveGame } = useGame();
  const navigate = useNavigate();

  const form = useForm<GameLobbyForm>({
    resolver: zodResolver(gameLobbySchema),
    defaultValues: {
      playlistId: "",
    },
  });

  const onSubmit = async (values: GameLobbyForm) => {
    if (!game) return;

    try {
      await startRound(values.playlistId);
    } catch (error) {
      toast.error("Failed to start round");
      console.error(error);
    }
  };

  const handleLeaveGame = async () => {
    if (!game) return;

    try {
      await leaveGame();

      void navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to leave game");
      console.error(error);
    }
  };

  const inviteLink = `${window.location.origin}/game/${String(game?.game_id)}`;

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy invite link");
      console.error("Failed to copy invite link", error);
    }
  };

  const shareInviteLink = async () => {
    try {
      await navigator.share({
        title: "Join my Blind Test game!",
        text: "Click this link to join my music quiz game:",
        url: inviteLink,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!game) {
    return <div>Game not found</div>;
  }

  const isHost = me?.user_id === game.host_id;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center md:max-w-xl">
      <h1 className="py-8 text-4xl font-bold">Waiting for host...</h1>
      <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:w-full max-md:flex-1 max-md:rounded-b-none max-md:shadow-none">
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
              {isHost ? (
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
              ) : null}
              <div className="flex w-full gap-2">
                {isHost ? (
                  <Button type="submit" className="flex-1">
                    <Play className="h-4 w-4" />
                    Start Game
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className={cn(!isHost && "flex-1")}
                  onClick={handleLeaveGame}
                >
                  <LogOut className="h-4 w-4" />
                  Leave Game
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
