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
import { useDebounce } from '@/hooks/useDebounce';

interface PlaylistSearchProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PlaylistSearch({ value, onChange }: PlaylistSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Query for search results
  const searchQuery = useQuery<SpotifySearchResponse>({
    queryKey: ['spotify-search', debouncedSearch],
    queryFn: () => searchSpotifyPlaylists(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Query for selected playlist details
  const selectedPlaylistQuery = useQuery<SpotifyPlaylist>({
    queryKey: ['spotify-playlist', value],
    queryFn: () => getSpotifyPlaylist(value!),
    enabled: !!value,
    staleTime: 1000 * 60 * 5,
  });

  const playlists = (searchQuery.data?.playlists?.items ?? []).filter(
    (playlist) => playlist !== null,
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
      <PopoverContent className="w-[460px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Spotify playlists..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {searchQuery.isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Searching playlists...
                </p>
              </div>
            ) : searchQuery.isError ? (
              <div className="p-4 text-center text-sm text-destructive">
                Error loading playlists. Please try again.
              </div>
            ) : (
              <CommandEmpty>No playlists found.</CommandEmpty>
            )}

            {!searchQuery.isLoading && !searchQuery.isError && (
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
