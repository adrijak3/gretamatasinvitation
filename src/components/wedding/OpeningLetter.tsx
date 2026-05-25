import { useState } from "react";

type OpeningLetterProps = {
  greeting: string;
  onOpen: () => void;
};

export const OpeningLetter = ({ greeting, onOpen }: OpeningLetterProps) => {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => onOpen(), 2200);
  };



  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-8 text-foreground transition-opacity duration-700 ${
        opening ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDelay: opening ? "1.6s" : "0s",
        backgroundColor: "hsl(var(--background))",
        backgroundImage: [
          "radial-gradient(circle at 18% 18%, hsl(var(--moss-soft) / 0.55), transparent 28rem)",
          "radial-gradient(circle at 82% 24%, hsl(var(--copper) / 0.12), transparent 28rem)",
          "radial-gradient(circle at 25% 85%, hsl(var(--moss) / 0.28), transparent 34rem)",
          "linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary)))",
        ].join(","),
      }}
      aria-label={greeting}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 paper-grain" />

      <div className="relative w-full max-w-[560px] text-center animate-scale-in">
        <p className="mb-7 font-display text-xs uppercase tracking-[0.42em] text-chocolate/70 sm:text-sm">
          Atverkite kvietimą
        </p>

        <div className="relative mx-auto w-full max-w-[470px] pb-8">
          <button
            type="button"
            onClick={handleOpen}
            disabled={opening}
            aria-label="Atverti voką"
            className="group relative z-10 block w-full disabled:pointer-events-none"
          >
            {/* Envelope body — clean outline only */}
            <div className="relative aspect-[5/3.35] w-full overflow-hidden rounded-sm border-2 border-chocolate/40 bg-[linear-gradient(180deg,hsl(var(--pearl)),hsl(var(--vellum)))] shadow-[0_32px_80px_hsl(var(--chocolate)/0.30)] transition-shadow duration-500 group-hover:shadow-[0_38px_100px_hsl(var(--chocolate)/0.40)]">
              <div className="absolute inset-x-0 bottom-6 z-10 text-center">
                <p className="font-display text-2xl tracking-[0.32em] text-chocolate sm:text-3xl">
                  2026.09.06
                </p>
              </div>
            </div>

            {/* Envelope flap with triangle outline + wax seal */}
            <div
              className={`absolute -top-px left-0 right-0 z-20 origin-top transition-transform duration-1000 ${
                opening ? "[transform:rotateX(-180deg)]" : ""
              }`}
              style={{
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
                aspectRatio: "5 / 1.7",
              }}
            >
              <svg
                viewBox="0 0 500 170"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <radialGradient id="waxSeal" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#f5d98a" />
                    <stop offset="45%" stopColor="#c9a14a" />
                    <stop offset="100%" stopColor="#7a5a1c" />
                  </radialGradient>
                </defs>
                <path
                  d="M2,2 L498,2 L250,168 Z"
                  fill="hsl(var(--pearl))"
                  stroke="hsl(var(--chocolate) / 0.55)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <g>
                  <circle cx="250" cy="150" r="22" fill="url(#waxSeal)" stroke="#5a3f10" strokeWidth="1.2" />
                </g>
              </svg>
            </div>

          </button>

        </div>
      </div>
    </div>
  );
};
