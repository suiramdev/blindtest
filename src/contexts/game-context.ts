import { createContext } from "react";
import { type Game } from "@/utils/api/game";
import { type SubmitAnswerResponse, type Round } from "@/utils/api/round";
import { type Player } from "@/utils/api/player";

export interface GameContextType {
  game?: Game | null;
  players: Player[];
  rounds: Round[];
  round?: Round | null;
  me?: Player | null;
  error: Error | null;
  joinGame: (username: string) => Promise<Player>;
  startRound: (playlistId: string) => Promise<Round>;
  submitAnswer: (answer: string) => Promise<SubmitAnswerResponse>;
  leaveGame: () => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);
