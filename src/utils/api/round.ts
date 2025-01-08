import { z } from "zod";
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
    start_time: z.string(),
    created_at: z.string(),
    answers: z.array(AnswerSchema).optional(),
});

export type Round = z.infer<typeof RoundSchema>;
