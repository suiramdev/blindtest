import { useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audio-store";

interface AudioPlayerProps {
  src: string;
  startTime?: number;
  duration?: number;
  onPlayError?: (error: Error) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({
  src,
  startTime = 0,
  duration,
  onPlayError,
  onEnded,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { volume } = useAudioStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;

    // Set initial time if specified
    if (startTime > 0) {
      audio.currentTime = startTime;
    }

    // Handle autoplay
    if (autoPlay) {
      audio.play().catch((error: unknown) => {
        if (error instanceof Error) {
          onPlayError?.(error);
        }
      });
    }

    // Set up duration timer if specified
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (duration) {
      timer = setTimeout(() => {
        audio.pause();
        onEnded?.();
      }, duration * 1000);
    }

    return () => {
      audio.pause();
      if (timer) clearTimeout(timer);
    };
  }, [src, startTime, duration, volume, autoPlay, onPlayError, onEnded]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio ref={audioRef} src={src} onEnded={onEnded}>
      <track kind="captions" />
    </audio>
  );
}
