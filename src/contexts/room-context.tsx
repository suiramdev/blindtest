import { createContext } from "react";
import { type Room } from "@/utils/api/room";
import { type Player } from "@/utils/api/player";
import { type Round } from "@/utils/api/round";

interface RoomContext {
  room: Room | null;
  currentPlayer: Player | null;
  isHost: boolean;
  latestRound: Round | null;
  isLoading: boolean;
}

export const roomContext = createContext<RoomContext | undefined>(undefined);
