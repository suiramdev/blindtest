import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  searchSpotifyPlaylists,
  getSpotifyPlaylist,
} from "@/utils/api/spotify";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

interface PlaylistSearchProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PlaylistSearch({ value, onChange }: PlaylistSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // Query for search results
  const {
    data: playlists,
    isLoading: playlistsLoading,
    isError: playlistsError,
  } = useQuery({
    queryKey: ["spotify-search", debouncedSearch],
    queryFn: () => searchSpotifyPlaylists(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Query for selected playlist details
  const { data: selectedPlaylist, isLoading: selectedPlaylistLoading } =
    useQuery({
      queryKey: ["spotify-playlist", value],
      queryFn: () => {
        if (!value) throw new Error("No playlist selected");
        return getSpotifyPlaylist(value);
      },
      enabled: Boolean(value),
      staleTime: 1000 * 60 * 5,
    });

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
            {selectedPlaylist ? (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={selectedPlaylist.images[0].url}
                  alt={selectedPlaylist.name}
                />
                <AvatarFallback>
                  <Music2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : undefined}
            {selectedPlaylistLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              (selectedPlaylist?.name ?? "Select a playlist...")
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search Spotify playlists..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {playlistsLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Searching playlists...
                </p>
              </div>
            ) : null}

            {playlistsError ? (
              <div className="p-4 text-center text-sm text-destructive">
                Error loading playlists. Please try again.
              </div>
            ) : null}

            {!playlistsLoading && !playlistsError && !playlists?.length && (
              <CommandEmpty>No playlists found.</CommandEmpty>
            )}

            {!playlistsLoading && !playlistsError && playlists ? (
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
                        {playlist.tracks.total || 0} tracks
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === playlist.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
