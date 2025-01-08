import { useState } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRoom } from "@/hooks/use-room";
import { AudioPlayer } from "@/components/audio-player";
import { PlayersList } from "../players-list";
import { AnswerForm } from "./answer-form";
import { RoundTimer } from "./round-timer";
import { RoundResults } from "./round-results";

const ROUND_DURATION = 30; // seconds

function getTimeElapsed(startTime: string | Date): number {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / 1000);
}

export function PlayRoom() {
  const { room, latestRound } = useRoom();
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const isRoundOver =
    latestRound && getTimeElapsed(latestRound.created_at) >= ROUND_DURATION;

  if (!room) return null;

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center md:max-w-xl">
      <Card className="flex w-full flex-col justify-between space-y-8 p-4 max-md:w-full max-md:flex-1 max-md:rounded-none max-md:border-none max-md:shadow-none">
        <PlayersList />
        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-4">
            {!isRoundOver && latestRound ? (
              <RoundTimer startTime={latestRound.created_at} />
            ) : null}
          </div>
          {needsUserInteraction ? (
            <Button
              onClick={() => {
                setNeedsUserInteraction(false);
              }}
              className="w-full"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Game
            </Button>
          ) : (
            latestRound &&
            (isRoundOver ? (
              <RoundResults room={room} round={latestRound} />
            ) : (
              <>
                {latestRound.track.preview_url ? (
                  <AudioPlayer
                    src={latestRound.track.preview_url}
                    startTime={getTimeElapsed(latestRound.created_at)}
                    duration={
                      ROUND_DURATION - getTimeElapsed(latestRound.created_at)
                    }
                    autoPlay
                    onPlayError={(error) => {
                      if (error.name === "NotAllowedError") {
                        setNeedsUserInteraction(true);
                      } else {
                        toast.error("Failed to play audio");
                        console.error("Failed to play audio:", error);
                      }
                    }}
                  />
                ) : null}
                <AnswerForm round={latestRound} />
              </>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
