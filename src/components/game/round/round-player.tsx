import { memo } from "react";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/audio-player";
import { env } from "@/utils/env";
import { getTimeElapsed } from "@/utils/time";
import { ProfilerProvider } from "@/components/providers/profiler-provider";

interface RoundPlayerProps {
  previewUrl: string;
  startedAt: Date;
}

export const RoundPlayer = memo(function RoundPlayer({
  previewUrl,
  startedAt,
}: RoundPlayerProps) {
  return (
    <ProfilerProvider id="RoundPlayer">
      <AudioPlayer
        src={previewUrl}
        startTime={getTimeElapsed(startedAt)}
        duration={env.VITE_ROUND_DURATION - getTimeElapsed(startedAt)}
        autoPlay
        onPlayError={(error) => {
          toast.error("Failed to play audio");
          console.error("Failed to play audio:", error);
        }}
      />
    </ProfilerProvider>
  );
});
