import { Camera, Heart } from "lucide-react";
import groomChild from "@/assets/groom-child.png";

type PolaroidProps = {
  name: string;
  role: string;
  rotate: string;
  imgSrc?: string;
};

const Polaroid = ({ name, role, rotate, imgSrc }: PolaroidProps) => (
  <figure
    className={`paper-grain relative w-[260px] shrink-0 border border-copper/25 bg-pearl p-3 pb-16 shadow-[0_28px_60px_hsl(var(--moss-deep)/0.28)] transition-transform duration-500 hover:-translate-y-2 hover:rotate-0 sm:w-[300px] ${rotate}`}
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,hsl(var(--moss-soft)/0.4),hsl(var(--vellum)))]">
      {imgSrc ? (
        <img src={imgSrc} alt={name} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-moss-deep/40">
          <Camera className="h-10 w-10" aria-hidden="true" />
        </div>
      )}
    </div>
    <figcaption className="absolute inset-x-0 bottom-3 text-center">
      <p className="font-display text-3xl text-moss-deep" style={{ fontFamily: "'Caveat', cursive" }}>
        {name}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.35em] text-copper/80">{role}</p>
    </figcaption>
  </figure>
);

export const Polaroids = () => (
  <section className="relative overflow-hidden bg-vellum py-14">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--chocolate)/0.06),transparent_60%)]" />

    <div className="container relative mx-auto px-6 text-center">
      <p className="font-display italic text-xs uppercase tracking-[0.4em] text-chocolate sm:text-sm">Atpažįstate šiuos mažuosius?</p>
      <h2 className="mt-1 font-display text-lg font-medium text-chocolate sm:text-xl">Tai mes vaikystėje</h2>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Polaroid name="Greta" role="Jaunoji" rotate="-rotate-6" />
        <div className="hidden text-chocolate sm:block">
          <Heart className="h-7 w-7 fill-chocolate/30" />
        </div>
        <Polaroid name="Matas" role="Jaunikis" rotate="rotate-6" imgSrc={groomChild} />
      </div>
    </div>
  </section>
);

