import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getCurrentSession } from "./auth";

export const PlayerSchema = z.object({
  player_id: z.string().uuid(),
  game_id: z.string(),
  user_id: z.string().uuid(),
  username: z.string(),
  score: z.number().int().default(0),
  created_at: z.string(),
});

export type Player = z.infer<typeof PlayerSchema>;

export async function createPlayer(
  gameId: string,
  username: string,
): Promise<Player> {
  const session = await getCurrentSession();

  if (!session) throw new Error("Not authenticated");

  const response = await supabase
    .from("players")
    .insert({
      game_id: gameId,
      user_id: session.user.id,
      username,
    })
    .select()
    .single();

  if (response.error) throw new Error("Failed to create player");

  return PlayerSchema.parse(response.data);
}

export async function fetchPlayers(gameId: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId);

  if (error) throw new Error("Failed to get players");

  return z.array(PlayerSchema).parse(data);
}

export async function fetchCurrentPlayer(
  gameId: string,
): Promise<Player | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const players = await fetchPlayers(gameId);

  return players.find((player) => player.user_id === session.user.id) ?? null;
}
