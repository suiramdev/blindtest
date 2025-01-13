import { memo, useEffect, useState } from "react";
import { env } from "@/utils/env";
import { getTimeElapsed } from "@/utils/time";
import { ProfilerProvider } from "@/components/providers/profiler-provider";

interface RoundTimerProps {
  startedAt: Date;
}

export const RoundTimer = memo(function RoundTimer({
  startedAt,
}: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const elapsed = getTimeElapsed(startedAt);
    const remaining = Math.max(env.VITE_ROUND_DURATION - elapsed, 0);

    setTimeLeft(remaining);

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        const newTime = Math.max(time - 1, 0);
        if (newTime === 0) clearInterval(timer);
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [startedAt]);

  return (
    <ProfilerProvider id="RoundTimer">
      <div className="font-mono text-2xl">{timeLeft}s</div>
    </ProfilerProvider>
  );
});
