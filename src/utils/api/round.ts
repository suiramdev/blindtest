import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { SpotifyTrackSchema } from "./spotify";

export const AnswerSchema = z.object({
  answer_id: z.string().uuid(),
  round_id: z.string(),
  player_id: z.string().uuid(),
  answer: z.string(),
  score: z.number().int(),
  created_at: z.string(),
});

export type Answer = z.infer<typeof AnswerSchema>;

export const RoundSchema = z.object({
  round_id: z.string().uuid(),
  room_id: z.string(),
  track: SpotifyTrackSchema,
  created_at: z.string(),
  answers: z.array(AnswerSchema).optional(),
});

export type Round = z.infer<typeof RoundSchema>;

export const SubmitAnswerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
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
