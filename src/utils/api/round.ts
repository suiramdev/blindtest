import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { SpotifyTrackSchema } from "./spotify";

export const AnswerSchema = z.object({
  answer_id: z.string().uuid(),
  round_id: z.string(),
  player_id: z.string().uuid(),
  answer: z.string(),
  score: z.number().int(),
  created_at: z.coerce.date(),
});

export type Answer = z.infer<typeof AnswerSchema>;

export const RoundSchema = z.object({
  round_id: z.string().uuid(),
  game_id: z.string(),
  track: SpotifyTrackSchema.extend({
    preview_url: z.string(),
  }),
  created_at: z.coerce.date(),
  answers: z.array(AnswerSchema).optional(),
});

export type Round = z.infer<typeof RoundSchema>;

export async function fetchRounds(gameId: string): Promise<Round[]> {
  const response = await supabase
    .from("rounds")
    .select("*, answers(*)")
    .eq("game_id", gameId);

  return z.array(RoundSchema).parse(response.data);
}

export async function fetchRound(roundId: string): Promise<Round> {
  const response = await supabase
    .from("rounds")
    .select("*, answers(*)")
    .eq("round_id", roundId)
    .single();

  if (response.error) throw new Error("Failed to get round");

  return RoundSchema.parse(response.data);
}

export const SubmitAnswerResponseSchema = z.object({
  success: z.boolean(),
  score: z.number().int(),
});

export type SubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;

export async function submitAnswer(
  roundId: string,
  playerId: string,
  answer: string,
): Promise<SubmitAnswerResponse> {
  const response = await supabase.functions.invoke("submit-answer", {
    body: {
      roundId,
      playerId,
      answer,
    },
  });

  if (response.error) throw response.error;

  return SubmitAnswerResponseSchema.parse(response.data);
}
