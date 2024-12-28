import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

const MAX_RETRIES = 5; // Maximum number of attempts to find a track with preview URL

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify credentials');
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface StartRoundRequest {
  roomId: string;
  playlistId: string;
}

async function getTrackPreviewUrl(trackId: string): Promise<string | null> {
  try {
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
    const response = await fetch(embedUrl);

    if (!response.ok) {
      console.error('Failed to fetch embed page:', response.status);
      return null;
    }

    const html = await response.text();
    const scriptContent = html.match(/<script[^>]*>({[^<]+})<\/script>/)?.[1];

    if (!scriptContent) {
      return null;
    }

    // Parse the JSON content and find the audioPreview node
    const jsonData = JSON.parse(scriptContent);
    const audioPreview = findAudioPreview(jsonData);
    return audioPreview?.url ?? null;
  } catch (error) {
    console.error('Error fetching preview URL:', error);
    return null;
  }
}

function findAudioPreview(obj: any): any {
  if (!obj || typeof obj !== 'object') return null;
  if ('audioPreview' in obj) return obj.audioPreview;
  for (const key in obj) {
    const result = findAudioPreview(obj[key]);
    if (result) return result;
  }
  return null;
}

serve(async (req, maxRetries = MAX_RETRIES) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { roomId, playlistId }: StartRoundRequest = await req.json();

    // Get playlist tracks from Spotify
    const accessToken = await getSpotifyAccessToken();
    const response = await fetch(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    const tracks = data.items
      .filter((item: any) => item && item.track)
      .map((item: any) => item.track);

    if (tracks.length === 0) {
      throw new Error('No tracks found');
    }

    // Select random track
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    // Stop if we've exhausted all retries
    if (maxRetries <= 0) {
      throw new Error(
        'Failed to find a track with preview URL after maximum retries',
      );
    }

    // Get preview URL for the selected track
    const previewUrl = await getTrackPreviewUrl(randomTrack.id);

    if (!previewUrl) {
      console.log(
        `No preview URL found for track ${randomTrack.id}, retries left: ${maxRetries - 1}`,
      );
      // Try again with one less retry
      return await serve(req, maxRetries - 1);
    }

    // Start a database transaction
    const { data: round, error: roundError } = await supabase.rpc(
      'start_game_round',
      {
        p_room_id: roomId,
        p_track: {
          ...randomTrack,
          preview_url: previewUrl,
        },
      },
    );

    if (roundError) throw roundError;

    return new Response(
      JSON.stringify({
        ...round,
        preview_url: previewUrl,
        track_name: randomTrack.name,
        artist_name: randomTrack.artists[0].name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
