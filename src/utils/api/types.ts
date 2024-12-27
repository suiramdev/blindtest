import { z } from 'zod';

export const PlayerSchema = z.object({
  player_id: z.string().uuid(),
  room_id: z.string(),
  user_id: z.string().uuid(),
  username: z.string(),
  player_score: z.number().int().default(0),
  created_at: z.string(),
});

export const RoomSchema = z.object({
  room_id: z.string(),
  host_id: z.string().uuid(),
  playlist_id: z.string().nullable(),
  created_at: z.string(),
  status: z.enum(['waiting', 'playing', 'finished']).default('waiting'),
});

export type Player = z.infer<typeof PlayerSchema>;
export type Room = z.infer<typeof RoomSchema>;
