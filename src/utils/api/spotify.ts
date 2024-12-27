import { supabase } from '@/lib/supabase';
import { SpotifySearchResponse, SpotifyPlaylist } from './types';

export async function searchSpotifyPlaylists(
  query: string,
): Promise<SpotifySearchResponse> {
  const { data, error } = await supabase.functions.invoke('spotify-search', {
    body: { query },
  });

  if (error) throw error;

  return data;
}

export async function getSpotifyPlaylist(
  playlistId: string,
): Promise<SpotifyPlaylist> {
  const { data, error } = await supabase.functions.invoke('spotify-playlist', {
    body: { playlistId },
  });

  if (error) throw error;

  return data;
}
