import { Volume2 } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";
import { Slider } from "@/components/ui/slider";

export function Header() {
  const { volume, setVolume } = useAudioStore();

  return (
    <header className="relative flex w-full items-center justify-end border-b bg-background p-4">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        <Slider
          className="w-24"
          defaultValue={[volume]}
          max={1}
          step={0.01}
          onValueChange={(value: number[]) => {
            setVolume(value[0]);
          }}
        />
      </div>
    </header>
  );
}
