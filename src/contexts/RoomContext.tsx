import { createContext } from 'react';
import { Room } from '@/utils/api/room';
import { Player } from '@/utils/api/player';
import { Round } from '@/utils/api/round';

type RoomContext = {
  room: Room | null;
  currentPlayer: Player | null;
  isHost: boolean;
  latestRound: Round | null;
  isLoading: boolean;
};

export const roomContext = createContext<RoomContext | undefined>(undefined);
