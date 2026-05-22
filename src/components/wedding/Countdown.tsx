import { Fragment, useEffect, useMemo, useState } from "react";

const target = new Date("2026-09-06T15:00:00+03:00").getTime();

const getTime = () => {
  const distance = Math.max(0, target - Date.now());
  return {
    dienos: Math.floor(distance / (1000 * 60 * 60 * 24)),
    valandos: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    sekundes: Math.floor((distance / 1000) % 60),
  };
};

export const Countdown = () => {
  const [time, setTime] = useState(getTime);
  const entries = useMemo(() => Object.entries(time), [time]);

  useEffect(() => {
    const interval = window.setInterval(() => setTime(getTime()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section id="countdown" className="relative overflow-hidden border-y border-copper/20 bg-moss-deep py-16 text-primary-foreground">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-copper to-transparent" />
      {/* soft floral haze */}
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(350_60%_85%/0.18),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--copper)/0.18),transparent_70%)]" />
      <div className="container relative mx-auto px-6 text-center">
        <p className="font-display italic text-3xl text-copper-glow sm:text-4xl tracking-[0.2em] uppercase">Iki vestuvių liko</p>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {entries.map(([label, value], idx) => (
            <Fragment key={label}>
              <div className="paper-grain overflow-hidden border border-pearl/20 bg-pearl/10 p-5 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <div className="font-display text-5xl font-semibold tabular-nums sm:text-6xl">{String(value).padStart(2, "0")}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.25em] text-pearl/75">{label}</div>
              </div>
              {idx < entries.length - 1 && (
                <div className="hidden items-center justify-center text-copper-glow/60 sm:flex" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 4 7 8 8-4 1-7 4-8 8-1-4-4-7-8-8 4-1 7-4 8-8z"/></svg>
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};