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
    setTimeout(() => onOpen(), 3600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 grid place-items-center overflow-y-auto px-4 py-8 text-foreground transition-opacity duration-700 ${
        opening ? "opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDelay: opening ? "2.9s" : "0s",
        backgroundColor: "hsl(var(--background))",
        backgroundImage: [
          "radial-gradient(circle at 18% 18%, hsl(var(--moss-soft) / 0.55), transparent 28rem)",
          "radial-gradient(circle at 82% 24%, hsl(var(--copper) / 0.12), transparent 28rem)",
          "radial-gradient(circle at 25% 85%, hsl(var(--moss) / 0.28), transparent 34rem)",
          "linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary)))",
        ].join(","),
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 paper-grain" />

      <div className="pointer-events-none absolute right-5 top-1/2 hidden -translate-y-1/2 select-none text-right font-display text-[7.5rem] font-semibold leading-[0.78] tracking-normal text-moss-deep/10 lg:block xl:right-14 xl:text-[9rem]">
        <div>26</div>
        <div>09</div>
        <div>06</div>
      </div>

      <div className="relative w-full max-w-[560px] text-center animate-scale-in">
        <p className="mb-7 font-display text-xs uppercase tracking-[0.42em] text-moss-deep/70 sm:text-sm">
          Atverkite kvietimą
        </p>
        <div
          className="relative mx-auto w-full max-w-[470px] pb-8 pt-24 sm:pt-36"
          style={{ perspective: "1400px" }}
        >
          <div
            className={`lace-heart-invite pointer-events-none absolute left-1/2 top-0 z-30 w-[min(86vw,390px)] -translate-x-1/2 ${opening ? "is-open" : ""}`}
            aria-hidden={!opening}
          >
            <svg viewBox="0 0 500 455" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <pattern id="laceDots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.4" fill="hsl(var(--pearl))" />
                </pattern>
              </defs>
              {/* outer white lace ring */}
              <path
                d="M250 432C160 354 56 287 56 168c0-68 50-118 112-118 40 0 70 22 82 50 12-28 42-50 82-50 62 0 112 50 112 118 0 119-104 186-194 264Z"
                fill="none"
                stroke="hsl(var(--pearl))"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                d="M250 432C160 354 56 287 56 168c0-68 50-118 112-118 40 0 70 22 82 50 12-28 42-50 82-50 62 0 112 50 112 118 0 119-104 186-194 264Z"
                fill="none"
                stroke="url(#laceDots)"
                strokeWidth="22"
              />
              <path
                d="M250 432C160 354 56 287 56 168c0-68 50-118 112-118 40 0 70 22 82 50 12-28 42-50 82-50 62 0 112 50 112 118 0 119-104 186-194 264Z"
                fill="none"
                stroke="hsl(var(--pearl) / 0.85)"
                strokeWidth="6"
                strokeDasharray="1 6"
              />
              {/* inner heart card */}
              <path
                d="M250 408C170 343 88 282 88 178c0-54 38-94 90-94 36 0 62 22 80 56 18-34 44-56 80-56 52 0 90 40 90 94 0 104-82 165-162 230Z"
                fill="hsl(var(--pearl) / 0.96)"
                stroke="hsl(var(--copper) / 0.35)"
                strokeWidth="1.5"
              />
            </svg>

            {/* heart burst around invitation */}
            <div className="heart-burst absolute inset-0 z-20">
              {[
                { dx: "-180px", dy: "-160px", d: "0s" },
                { dx: "180px", dy: "-160px", d: ".4s" },
                { dx: "-210px", dy: "20px", d: ".8s" },
                { dx: "210px", dy: "20px", d: "1.2s" },
                { dx: "-120px", dy: "180px", d: "1.6s" },
                { dx: "120px", dy: "180px", d: "2s" },
              ].map((h, i) => (
                <span key={i} style={{ ["--dx" as any]: h.dx, ["--dy" as any]: h.dy, animationDelay: h.d }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                    <path d="M12 21s-7-4.5-9.5-9C.5 8 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
                  </svg>
                </span>
              ))}
            </div>

            <div className="relative z-10 mx-auto flex aspect-[1.1/1] w-full flex-col items-center justify-center px-14 pb-12 pt-16 text-center">
              <p className="font-display text-2xl font-semibold leading-tight text-moss-deep sm:text-3xl">{greeting}</p>
              <p className="mt-3 max-w-[250px] text-sm leading-6 text-muted-foreground sm:text-base">
                kviečiame kartu švęsti mūsų santuokos dieną.
              </p>
              <p className="mt-4 font-display text-sm uppercase tracking-[0.32em] text-copper">2026 09 06</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            disabled={opening}
            aria-label="Atverti voką"
            className="group relative z-20 block w-full disabled:pointer-events-none"
          >
            <div className="relative aspect-[5/3.35] w-full overflow-hidden rounded-sm border border-copper/25 bg-[linear-gradient(180deg,hsl(var(--pearl)),hsl(var(--vellum)))] shadow-[0_32px_80px_hsl(var(--moss-deep)/0.34)] transition-shadow duration-500 group-hover:shadow-[0_38px_100px_hsl(var(--moss-deep)/0.42)]">
              <div className="absolute inset-x-8 top-20 z-30 text-center">
                <p className="font-display text-sm uppercase tracking-[0.36em] text-moss-deep/65">Vestuvinis kvietimas</p>
                <h1 className="mt-3 font-display text-4xl font-semibold leading-none text-moss-deep sm:text-5xl">
                  Greta ir Matas
                </h1>
              </div>
            </div>

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
              <div
                className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--pearl)),hsl(var(--vellum)))] shadow-[0_4px_14px_hsl(var(--moss-deep)/0.18)]"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
              <svg
                viewBox="0 0 500 170"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <pattern id="scallops" x="0" y="0" width="14" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="7" cy="2" r="6" fill="hsl(var(--pearl))" />
                  </pattern>
                </defs>
                <path d="M0,0 L250,170 L250,160 L8,-4 Z" fill="url(#scallops)" opacity="0.95" />
                <path d="M500,0 L250,170 L250,160 L492,-4 Z" fill="url(#scallops)" opacity="0.95" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
