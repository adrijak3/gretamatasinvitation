import { useEffect, useRef, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import weddingMusic from "@/assets/elegant-wedding-video.mp3";

type MusicPlayerProps = {
  enabled: boolean;
};

export const MusicPlayer = ({ enabled }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !enabled) return;
    audio.volume = 0.35;
    audio.loop = true;
    audio.play().catch(() => undefined);
  }, [enabled]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-copper/30 bg-vellum/90 px-3 py-2 shadow-[0_12px_36px_hsl(var(--moss-deep)/0.2)] backdrop-blur">
      <audio ref={audioRef} src={weddingMusic} preload="auto" />
      <Music className="h-4 w-4 text-copper" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-full bg-moss text-moss-foreground transition-transform hover:scale-105 active:scale-95"
        aria-label={muted ? "Įjungti muziką" : "Išjungti muziką"}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
};