import { z } from 'zod';

const PreviewUrlSchema = z
  .object({
    url: z.string().url(),
  })
  .nullable();

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

    // Parse the JSON content and find the audioPreview node
    const jsonData = JSON.parse(scriptContent);
    const audioPreview = findAudioPreview(jsonData);

    // Validate the preview URL
    const parsed = PreviewUrlSchema.parse(audioPreview);
    return parsed?.url ?? null;
  } catch (error) {
    console.error('Error fetching preview URL:', error);
    return null;
  }
}

function findAudioPreview(obj: any): any {
  if (!obj || typeof obj !== 'object') return null;

  if ('audioPreview' in obj) {
    return obj.audioPreview;
  }

  for (const key in obj) {
    const result = findAudioPreview(obj[key]);
    if (result) return result;
  }

  return null;
}
