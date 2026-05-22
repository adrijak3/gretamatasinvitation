import { useState } from "react";

type OpeningLetterProps = {
  greeting: string;
  onOpen: () => void;
};

export const OpeningLetter = ({ greeting, onOpen }: OpeningLetterProps) => {
  const [opening, setOpening] = useState(false);
  const [burst, setBurst] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(() => onOpen(), 2200);
  };

  const handleSealClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (opening) return;
    setBurst(true);
    setTimeout(() => setBurst(false), 900);
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
              {/* date initials on envelope */}
              <div className="absolute inset-x-0 bottom-6 z-10 text-center">
                <p className="font-display text-2xl tracking-[0.32em] text-chocolate sm:text-3xl">
                  26 · 09 · 06
                </p>
              </div>
            </div>

            {/* Envelope flap with triangle outline */}
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
                <path
                  d="M2,2 L498,2 L250,168 Z"
                  fill="hsl(var(--pearl))"
                  stroke="hsl(var(--chocolate) / 0.55)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Seal / monogram bubble — clickable */}
            <button
              type="button"
              onClick={handleSealClick}
              aria-label="Burbuliukas"
              className="absolute left-1/2 top-[36%] z-30 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-chocolate/50 bg-pearl shadow-[0_8px_24px_hsl(var(--chocolate)/0.35)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-20 sm:w-20"
            >
              <span className="font-display text-base tracking-[0.15em] text-chocolate sm:text-lg">
                G&amp;M
              </span>
              {burst && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 grid place-items-center"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="hsl(var(--chocolate))"
                    className="h-10 w-10 animate-heart-pop sm:h-12 sm:w-12"
                  >
                    <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
                  </svg>
                </span>
              )}
            </button>
          </button>
        </div>
      </div>
    </div>
  );
};
