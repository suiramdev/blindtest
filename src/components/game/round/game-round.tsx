import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useGame } from "@/hooks/use-game";
import { env } from "@/utils/env";
import { ProfilerProvider } from "@/components/providers/profiler-provider";
import { getTimeElapsed } from "@/utils/time";
import { PlayersList } from "../players-list";
import { AnswerForm } from "./answer-form";
import { RoundTimer } from "./round-timer";
import { RoundPlayer } from "./round-player";
import { AnswerResults } from "./answer-results";
import { RoundResults } from "./round-results";

export function GameRound() {
  const { game, me: player, round, submitAnswer } = useGame();
  const [isRoundOver, setIsRoundOver] = useState(false);

  useEffect(() => {
    if (!round?.created_at) return;

    const elapsed = getTimeElapsed(round.created_at);
    const remaining = Math.max(env.VITE_ROUND_DURATION - elapsed, 0);

    setIsRoundOver(remaining === 0);

    const timer = setTimeout(() => {
      console.log("Setting isRoundOver due to timer expiration");
      setIsRoundOver(true);
    }, remaining * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [round?.created_at]);

  if (!game || !player || !round) return null;

  return (
    <ProfilerProvider id="GameRound">
      <div className="flex w-full flex-1 flex-col items-center justify-center md:max-w-xl">
        <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:w-full max-md:flex-1 max-md:rounded-none max-md:border-none max-md:shadow-none">
          <PlayersList />
          <div className="flex flex-col gap-4">
            {isRoundOver ? (
              <RoundResults />
            ) : (
              <>
                <div className="flex justify-end gap-4">
                  <RoundTimer startedAt={round.created_at} />
                </div>
                <AnswerForm
                  onSubmitAnswer={submitAnswer}
                  results={<AnswerResults />}
                />
              </>
            )}
          </div>
        </Card>
      </div>
      {!isRoundOver && (
        <RoundPlayer
          previewUrl={round.track.preview_url}
          startedAt={round.created_at}
        />
      )}
    </ProfilerProvider>
  );
}
