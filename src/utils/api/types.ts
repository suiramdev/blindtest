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
  current_round_id: z.string().uuid().nullable(),
  created_at: z.string(),
  status: z.enum(['waiting', 'playing', 'finished']).default('waiting'),
});

export const SpotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export const SpotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(SpotifyImageSchema),
  owner: z.object({
    display_name: z.string(),
  }),
  tracks: z.object({
    total: z.number(),
  }),
});

export const SpotifySearchResponseSchema = z.object({
  playlists: z.object({
    items: z.array(SpotifyPlaylistSchema),
    total: z.number(),
  }),
});

export const RoundSchema = z.object({
  round_id: z.string().uuid(),
  room_id: z.string(),
  track_id: z.string(),
  track: z.object({
    name: z.string(),
    artists: z.array(z.object({ name: z.string() })),
    preview_url: z.string(),
  }),
  answers: z
    .record(
      z.object({
        answer: z.string(),
        score: z.number(),
        answeredAt: z.string(),
      }),
    )
    .default({}),
  created_at: z.string(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>;
export type SpotifySearchResponse = z.infer<typeof SpotifySearchResponseSchema>;
export type Round = z.infer<typeof RoundSchema>;
