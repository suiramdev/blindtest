import { RoomContext } from '@/contexts/RoomContext';
import { useContext } from 'react';

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }

  return context;
}
