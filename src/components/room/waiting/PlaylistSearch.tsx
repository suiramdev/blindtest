import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  searchSpotifyPlaylists,
  getSpotifyPlaylist,
} from '@/utils/api/spotify';
import { cn } from '@/lib/utils';
import { SpotifySearchResponse, SpotifyPlaylist } from '@/utils/api/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PlaylistSearchProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PlaylistSearch({ value, onChange }: PlaylistSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Query for search results
  const searchQuery = useQuery<SpotifySearchResponse>({
    queryKey: ['spotify-search', search],
    queryFn: () => searchSpotifyPlaylists(search),
    enabled: search.length > 0,
  });

  // Query for selected playlist details
  const selectedPlaylistQuery = useQuery<SpotifyPlaylist>({
    queryKey: ['spotify-playlist', value],
    queryFn: () => getSpotifyPlaylist(value!),
    enabled: !!value,
  });

  const playlists = (searchQuery.data?.playlists?.items || []).filter(
    (playlist): playlist is NonNullable<typeof playlist> =>
      playlist !== null &&
      typeof playlist.id === 'string' &&
      typeof playlist.name === 'string' &&
      typeof playlist.images?.[0]?.url === 'string',
  );

  const selectedPlaylist = value
    ? (selectedPlaylistQuery.data ?? playlists.find((p) => p.id === value))
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedPlaylist && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={selectedPlaylist.images[0].url}
                  alt={selectedPlaylist.name}
                />
                <AvatarFallback>
                  <Music2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            {selectedPlaylistQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              selectedPlaylist?.name || 'Select playlist...'
            )}
          </div>
          <Music2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[460px] p-0">
        <Command>
          <CommandInput
            placeholder="Search Spotify playlists..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {searchQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : searchQuery.error ? (
                'Error loading playlists.'
              ) : (
                'No playlists found.'
              )}
            </CommandEmpty>
            {playlists.length > 0 && (
              <CommandGroup>
                {playlists.map((playlist) => (
                  <CommandItem
                    key={playlist.id}
                    value={playlist.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={playlist.images[0].url}
                        alt={playlist.name}
                      />
                      <AvatarFallback>
                        <Music2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{playlist.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {playlist.tracks?.total || 0} tracks
                      </span>
                    </div>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        value === playlist.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}