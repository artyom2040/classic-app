import { Linking } from 'react-native';

export type MusicService = 'spotify' | 'appleMusic' | 'youtube';

interface MusicLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
}

// Build proper deep links for music services
export function buildSpotifySearchUrl(query: string): string {
  return `spotify://search/${encodeURIComponent(query)}`;
}

export function buildSpotifyWebUrl(query: string): string {
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

export function buildAppleMusicUrl(query: string): string {
  return `https://music.apple.com/search?term=${encodeURIComponent(query)}`;
}

export function buildYouTubeUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

// Open music with fallback
export async function openInMusicService(
  query: string,
  preferredService: MusicService = 'spotify'
): Promise<void> {
  const services = {
    spotify: async () => {
      const appUrl = buildSpotifySearchUrl(query);
      const webUrl = buildSpotifyWebUrl(query);
      const canOpen = await Linking.canOpenURL(appUrl);
      await Linking.openURL(canOpen ? appUrl : webUrl);
    },
    appleMusic: async () => {
      const url = buildAppleMusicUrl(query);
      await Linking.openURL(url);
    },
    youtube: async () => {
      const url = buildYouTubeUrl(query);
      await Linking.openURL(url);
    },
  };

  try {
    await services[preferredService]();
  } catch (e) {
    // Fallback to YouTube if preferred fails
    await services.youtube();
  }
}

// Open specific composer work
export async function openComposerWork(composer: string, work: string): Promise<void> {
  const query = `${composer} ${work}`;
  await openInMusicService(query);
}

// Open album
export async function openAlbum(album: string, artist: string): Promise<void> {
  const query = `${album} ${artist}`;
  await openInMusicService(query);
}
