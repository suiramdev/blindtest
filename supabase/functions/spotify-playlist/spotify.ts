export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

/**
 * Gets a Spotify access token using client credentials flow
 * @returns Promise that resolves to the access token string
 * @throws Error if Spotify credentials are missing
 */
export async function getSpotifyAccessToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  const data = await response.json();
  return data.access_token;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  images: { url: string }[];
}

export async function getPlaylist(
  playlistId: string,
): Promise<SpotifyPlaylist | null> {
  const accessToken = await getSpotifyAccessToken();

  const response = await fetch(`${SPOTIFY_API_URL}/playlists/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data;
}
