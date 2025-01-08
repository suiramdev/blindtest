import { z } from "zod";
import { supabase } from "@/lib/supabase";

export const SpotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export type SpotifyImage = z.infer<typeof SpotifyImageSchema>;

export const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number(),
        width: z.number(),
      }),
    ),
  }),
  preview_url: z.string().nullable(),
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;

export const SpotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(SpotifyImageSchema),
  owner: z.object({
    display_name: z.string(),
  }),
  tracks: z.object({
    items: z.array(SpotifyTrackSchema),
    total: z.number(),
  }),
});

export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>;

export const SpotifySearchResponseSchema = z.object({
  playlists: z.object({
    items: z.array(SpotifyPlaylistSchema),
    total: z.number(),
  }),
});

export async function searchSpotifyPlaylists(
  query: string,
): Promise<SpotifyPlaylist[]> {
  const { data, error } = await supabase.functions.invoke("spotify-search", {
    body: { query },
  });

  if (error) throw error;

  return data;
}

export async function getSpotifyPlaylist(
  playlistId: string,
): Promise<SpotifyPlaylist> {
  const { data, error } = await supabase.functions.invoke("spotify-playlist", {
    body: { playlistId },
  });

  if (error) throw error;

  return data;
}
