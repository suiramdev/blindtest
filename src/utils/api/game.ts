import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { getCurrentSession } from "./auth";
import { createPlayer, fetchPlayers, type Player } from "./player";
import { type Round, RoundSchema } from "./round";

export const GameSchema = z.object({
  game_id: z.string(),
  host_id: z.string().uuid(),
  playlist_id: z.string().nullable(),
  created_at: z.string(),
  status: z.enum(["waiting", "playing", "finished"]).default("waiting"),
});

export type Game = z.infer<typeof GameSchema>;

export async function createGame(): Promise<Game> {
  const session = await getCurrentSession();

  if (!session) throw new Error("Not authenticated");

  const response = await supabase
    .from("games")
    .insert({ host_id: session.user.id })
    .select(`*`)
    .single();

  if (response.error) throw new Error("Failed to create game");

  return GameSchema.parse(response.data);
}

export async function fetchGame(gameId: string): Promise<Game | null> {
  const response = await supabase
    .from("games")
    .select(`*`)
    .eq("game_id", gameId)
    .single();

  if (response.error) throw new Error("Failed to get game");

  return GameSchema.parse(response.data);
}

export async function joinGame(
  gameId: string,
  username: string,
): Promise<Player> {
  // Verify game exists first
  await fetchGame(gameId);
  return createPlayer(gameId, username);
}

export async function leaveGame(gameId: string): Promise<void> {
  const session = await getCurrentSession();
  if (!session) throw new Error("Not authenticated");

  const game = await fetchGame(gameId);
  if (!game) throw new Error("Game not found");

  const isHost = game.host_id === session.user.id;

  // Remove player
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("game_id", gameId)
    .eq("user_id", session.user.id);

  if (error) throw new Error("Failed to leave game");

  if (isHost) {
    await handleHostLeaving(gameId, session.user.id);
  }
}

async function handleHostLeaving(
  gameId: string,
  userId: string,
): Promise<void> {
  const players = await fetchPlayers(gameId);
  const remainingPlayers = players.filter((p) => p.user_id !== userId);

  if (remainingPlayers.length > 0) {
    // Promote first remaining player to host
    await promoteNewHost(gameId, remainingPlayers[0].player_id);
  } else {
    // No other players, delete the game
    await deleteGame(gameId);
  }
}

export async function promoteNewHost(
  gameId: string,
  newHostPlayerId: string,
): Promise<void> {
  const response = await supabase.functions.invoke("promote-host", {
    body: {
      gameId,
      playerId: newHostPlayerId,
    },
  });

  if (response.error) throw new Error("Failed to promote new host");
}

async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase.from("games").delete().eq("game_id", gameId);

  if (error) throw new Error("Failed to delete game");
}

export async function kickPlayer(
  gameId: string,
  playerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("players")
    .delete()
    .eq("game_id", gameId)
    .eq("player_id", playerId);

  if (error) throw new Error("Failed to kick player");
}

export const RoundStartResponseSchema = z.object({
  round: RoundSchema,
});

export type RoundStartResponse = z.infer<typeof RoundStartResponseSchema>;

export async function startRound(
  gameId: string,
  playlistId: string,
): Promise<Round> {
  const response = await supabase.functions.invoke<RoundStartResponse>(
    "start-round",
    {
      body: {
        gameId,
        playlistId,
      },
    },
  );

  if (!response.data) throw new Error("Failed to start round");

  return RoundSchema.parse(response.data.round);
}
