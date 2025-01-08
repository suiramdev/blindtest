import { useContext } from "react";
import { roomContext } from "@/contexts/room-context";

export function useRoom() {
  const context = useContext(roomContext);

  if (!context) {
    throw new Error("useRoom must be used within RoomProvider");
  }
  return context;
}
