import { useEffect, useState } from 'react';

interface RoundTimerProps {
  startTime: string;
}

export function RoundTimer({ startTime }: RoundTimerProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - start) / 1000);
    const remaining = Math.max(30 - elapsed, 0);

    setTimeLeft(remaining);

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        const newTime = Math.max(time - 1, 0);
        if (newTime === 0) clearInterval(timer);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return <div className="text-2xl font-mono">{timeLeft}s</div>;
}
