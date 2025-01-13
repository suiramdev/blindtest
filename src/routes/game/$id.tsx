import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fetchGame } from "@/utils/api/game";
import { GameProvider } from "@/components/providers/game-provider";
import { GameContent } from "@/components/game/game-content";
import { JoinGameDialog } from "@/components/game/join-game-dialog";
import { fetchCurrentPlayer } from "@/utils/api/player";

export const Route = createFileRoute("/game/$id")({
  loader: async ({ params }) => {
    const game = await fetchGame(params.id);
    if (!game) {
      throw new Error("Game not found");
    }

    const me = await fetchCurrentPlayer(params.id);

    return { game, me };
  },
  component: GamePage,
});

function GamePage() {
  const { game, me } = Route.useLoaderData();
  const [joinDialogOpen, setJoinDialogOpen] = useState(!me);

  return (
    <GameProvider gameId={game.game_id}>
      <div className="flex h-full flex-1 items-center justify-center">
        <GameContent />
      </div>
      <JoinGameDialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen} />
    </GameProvider>
  );
}
