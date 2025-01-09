import { type ReactNode, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GameContext, type PlayerPresence } from "@/contexts/game-context";
import {
  fetchGame,
  joinGame,
  type Game,
  startRound,
  leaveGame,
} from "@/utils/api/game";
import { supabase } from "@/lib/supabase";
import { type Player, fetchPlayers } from "@/utils/api/player";
import { type Round, submitAnswer, fetchRounds } from "@/utils/api/round";

interface GameProviderProps {
  children: ReactNode;
  gameId: string;
}

export function GameProvider({ children, gameId }: GameProviderProps) {
  const queryClient = useQueryClient();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [playerPresence, setPlayerPresence] = useState<
    Record<string, PlayerPresence>
  >({});

  // Fetch game data
  const { data: game, error } = useQuery<Game | null>({
    queryKey: ["game", gameId],
    queryFn: () => fetchGame(gameId),
  });

  // Fetch players data
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["players", gameId],
    queryFn: () => fetchPlayers(gameId),
    enabled: Boolean(game),
  });

  // Fetch rounds data
  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ["rounds", gameId],
    queryFn: () => fetchRounds(gameId),
    enabled: Boolean(game), // Only fetch when game exists
  });

  // Set current player based on auth
  useEffect(() => {
    const checkCurrentPlayer = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const matchingPlayer = players.find(
        (player) => player.user_id === user.id,
      );

      if (matchingPlayer && !currentPlayer) {
        setCurrentPlayer(matchingPlayer);
      }
    };

    void checkCurrentPlayer();
  }, [players]);

  // Subscribe to game updates:
  useEffect(() => {
    if (!game) return;

    const gameChannel = supabase
      .channel(`game:${game.game_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        (payload) => {
          queryClient.setQueryData(["game", game.game_id], payload.new);
        },
      )
      .subscribe();

    return () => {
      void gameChannel.unsubscribe();
    };
  }, [game, queryClient]);

  // Subscribe to players updates
  useEffect(() => {
    if (!game) return;

    const playersChannel = supabase
      .channel(`players:${game.game_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => {
          // Invalidate and refetch players
          void queryClient.invalidateQueries({
            queryKey: ["players", game.game_id],
          });
        },
      )
      .subscribe();

    return () => {
      void playersChannel.unsubscribe();
    };
  }, [game, queryClient]);

  // Subscribe to rounds updates
  useEffect(() => {
    if (!game) return;

    const roundsChannel = supabase
      .channel(`rounds:${game.game_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rounds" },
        () => {
          // Invalidate and refetch rounds
          void queryClient.invalidateQueries({
            queryKey: ["rounds", game.game_id],
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "answers",
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ["rounds", game.game_id],
          });
        },
      )
      .subscribe();

    return () => {
      void roundsChannel.unsubscribe();
    };
  }, [game, queryClient]);

  // Update currentRound when rounds change
  useEffect(() => {
    if (!rounds.length) {
      setCurrentRound(null);
      return;
    }

    const latestRound = rounds[rounds.length - 1];
    setCurrentRound(latestRound);
  }, [rounds]);

  // Update currentPlayer when players change
  useEffect(() => {
    if (!currentPlayer) return;

    const updatedPlayer = players.find(
      (player) => player.player_id === currentPlayer.player_id,
    );

    if (updatedPlayer) {
      setCurrentPlayer(updatedPlayer);
    }
  }, [players, currentPlayer]);

  // Handle presence tracking
  useEffect(() => {
    if (!game || !currentPlayer) return;

    const channel = supabase.channel(`presence:${gameId}`, {
      config: {
        presence: {
          key: currentPlayer.player_id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState();
        const formattedPresence: Record<string, PlayerPresence> = {};

        Object.entries(newState).forEach(([playerId, _states]) => {
          formattedPresence[playerId] = {
            playerId,
            online: true,
            lastSeen: new Date(),
          };
        });

        setPlayerPresence(formattedPresence);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setPlayerPresence((prev) => ({
          ...prev,
          [key]: {
            playerId: key,
            online: true,
            lastSeen: new Date(),
          },
        }));
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setPlayerPresence((prev) => ({
          ...prev,
          [key]: {
            playerId: key,
            online: false,
            lastSeen: new Date(),
          },
        }));
      });

    void channel.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      void channel.unsubscribe();
    };
  }, [game, currentPlayer, gameId]);

  // Game actions using mutations
  const joinGameMutation = useMutation({
    mutationFn: (username: string) => joinGame(gameId, username),
    onSuccess: (player) => {
      setCurrentPlayer(player);
    },
  });

  const startRoundMutation = useMutation({
    mutationFn: (playlistId: string) => {
      if (!game) throw new Error("Game not found");

      return startRound(game.game_id, playlistId);
    },
    onSuccess: (round) => {
      setCurrentRound(round);
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (answer: string) => {
      if (!currentRound) throw new Error("Round not found");
      if (!currentPlayer) throw new Error("Player not found");

      return submitAnswer(
        currentRound.round_id,
        currentPlayer.player_id,
        answer,
      );
    },
  });

  const leaveGameMutation = useMutation({
    mutationFn: async () => {
      if (!game) throw new Error("Game not found");

      await leaveGame(game.game_id);
    },
    onSuccess: () => {
      setCurrentPlayer(null);
    },
  });

  return (
    <GameContext.Provider
      value={{
        game,
        players,
        playerPresence,
        rounds,
        round: currentRound,
        me: currentPlayer,
        error,
        joinGame: joinGameMutation.mutateAsync,
        startRound: startRoundMutation.mutateAsync,
        submitAnswer: submitAnswerMutation.mutateAsync,
        leaveGame: leaveGameMutation.mutateAsync,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
