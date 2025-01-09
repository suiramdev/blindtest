import { useGame } from "@/hooks/use-game";
import { GameLobby } from "./lobby/game-lobby";
import { GameRound } from "./round/game-round";

export function GameContent() {
  const { game } = useGame();

  if (!game) {
    return null;
  }

  return (
    <>
      {game.status === "waiting" && <GameLobby />}
      {game.status === "playing" && <GameRound />}
    </>
  );
}
