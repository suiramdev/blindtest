import { create } from "zustand";

interface AudioState {
  volume: number;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  volume: 0.5, // Default volume
  setVolume: (volume) => {
    set({ volume });
  },
}));
