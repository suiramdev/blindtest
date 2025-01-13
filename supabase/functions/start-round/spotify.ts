// Spotify API endpoints
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

/**
 * Gets a Spotify access token using client credentials flow
 * @returns Promise that resolves to the access token string
 * @throws Error if Spotify credentials are missing
 */
export async function getSpotifyAccessToken(): Promise<string> {
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

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
}

/**
 * Gets the tracks from a Spotify playlist
 * @param playlistId The Spotify playlist ID
 * @returns Promise that resolves to an array of SpotifyTrack objects
 */
export async function getTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const accessToken = await getSpotifyAccessToken();
  const response = await fetch(
    `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { items } = await response.json();

  return items
    ?.filter((item: { track: SpotifyTrack | null }) => item?.track)
    .map((item: { track: SpotifyTrack }) => item.track);
}

/**
 * Gets the preview URL for a Spotify track by scraping the embed page
 * @param trackId The Spotify track ID
 * @returns Promise that resolves to the preview URL string or null if not found
 */
export async function getTrackPreviewUrl(
  trackId: string,
): Promise<string | null> {
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

    const jsonData = JSON.parse(scriptContent);
    const audioPreview = findAudioPreview(jsonData);
    return audioPreview?.url ?? null;
  } catch (error) {
    console.error('Error fetching preview URL:', error);
    return null;
  }
}

interface AudioPreview {
  url: string;
}

/**
 * Recursively searches an object for an audio preview URL
 * @param obj The object to search through
 * @returns The AudioPreview object if found, null otherwise
 */
function findAudioPreview(obj: unknown): AudioPreview | null {
  if (!obj || typeof obj !== 'object') return null;

  if (
    'audioPreview' in obj &&
    obj.audioPreview &&
    typeof obj.audioPreview === 'object'
  ) {
    const preview = obj.audioPreview as AudioPreview;
    if ('url' in preview && typeof preview.url === 'string') {
      return preview;
    }
  }

  for (const key in obj as Record<string, unknown>) {
    const result = findAudioPreview((obj as Record<string, unknown>)[key]);
    if (result) return result;
  }

  return null;
}
