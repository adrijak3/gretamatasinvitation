import { Church, Clock, Gift, HeartHandshake, MapPin, UtensilsCrossed, PartyPopper, Wine, Leaf, Sparkles } from "lucide-react";
import { Countdown } from "./Countdown";
import { Polaroids } from "./Polaroids";
import churchPhoto from "@/assets/venue-church.jpg";
import restaurantPhoto from "@/assets/venue-restaurant.jpg";

// SVG icons (rings, plate, woman, man) — inline so they match stroke style
const Rings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="15" r="5.5" />
    <circle cx="16" cy="11" r="4.5" />
    <path d="M14 6.5l1.5-2 1.5 2" />
  </svg>
);
const PlateFood = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <ellipse cx="12" cy="15" rx="9" ry="3" />
    <path d="M5 15a7 7 0 0 1 14 0" />
    <circle cx="9.5" cy="12.5" r="1" />
    <circle cx="13" cy="11.5" r="1.2" />
    <path d="M15.5 13c.8-.6 1.6-.4 2 .3" />
  </svg>
);
const WomanIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="5" r="2.4" />
    <path d="M12 7.5 L8 20 H16 Z" />
    <path d="M9 13 H15" />
  </svg>
);
const ManIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="5" r="2.4" />
    <path d="M9 8h6l-1 5h-4z" />
    <path d="M10 13v7M14 13v7" />
  </svg>
);

const timeline = [
  { time: "14:40", title: "Atvykimas", icon: Church, text: "Prašome atvykti 15 min. anksčiau." },
  { time: "15:00", title: "Santuokos ceremonija", icon: Rings, text: "Šv. Kazimiero bažnyčia, Vilnius." },
  { time: "16:30", title: "Šampano stalelis", icon: Wine, text: "Kviečiame pakelti taurę už mūsų santuoką." },
  { time: "18:00", title: "Antroji šventės dalis", icon: PlateFood, text: "Restoranas Elven (N20)." },
  { time: "21:00", title: "Vakaro pabaiga", icon: PartyPopper, text: "Pirmasis šokis, tortas ir nakties šventė kartu su jumis." },
];

const WaveDivider = ({ flip = false, fill = "hsl(var(--vellum))" }: { flip?: boolean; fill?: string }) => (
  <div aria-hidden className={`wave-divider relative h-16 w-full ${flip ? "rotate-180" : ""}`}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={fill} />
    </svg>
  </div>
);

export const WeddingContent = () => (
  <main className="relative z-20">
    <section className="container mx-auto grid min-h-[92vh] content-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="animate-reveal">
        <p className="font-display italic text-4xl text-copper sm:text-5xl lg:text-6xl">Kviečiame švęsti kartu</p>
        <h2 className="mt-3 max-w-3xl font-display text-6xl font-semibold leading-[0.88] text-moss-deep sm:text-7xl lg:text-8xl">
          Greta &amp; Matas
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Rugsėjo 6 dieną kviečiame Jus pasitikti mūsų svarbiausią dieną — su žmonėmis, kurie mums brangūs. Lauksime Jūsų jaukioje, šiltoje mūsų šventėje.
        </p>
      </div>
      <div className="paper-grain relative overflow-hidden border border-copper/30 bg-vellum p-7 animate-fade-in-slow hover:shadow-[0_36px_90px_hsl(var(--moss-deep)/0.25)] transition-shadow duration-500 shadow-[0_30px_80px_hsl(var(--moss-deep)/0.18)]">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-copper/20" />
        <p className="font-display text-sm uppercase tracking-[0.32em] text-moss">2026 • 09 • 06</p>
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <Church className="mt-1 h-6 w-6 text-copper" />
            <div>
              <h3 className="font-display text-3xl text-moss-deep">Šv. Kazimiero bažnyčia</h3>
              <p className="text-muted-foreground">Ceremonija 15:00</p>
            </div>
          </div>
          <div className="flex gap-4">
            <UtensilsCrossed className="mt-1 h-6 w-6 text-copper" />
            <div>
              <h3 className="font-display text-3xl text-moss-deep">Restoranas Elven</h3>
              <p className="text-muted-foreground">Vakarinė dalis 18:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Countdown />
    <Polaroids />

    <WaveDivider fill="hsl(var(--vellum))" />

    <section id="schedule" className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display italic text-3xl uppercase tracking-[0.45em] text-copper">Programa</p>
        <h2 className="font-display text-5xl font-semibold text-moss-deep sm:text-6xl">Dienos eiga</h2>
      </div>
      <div className="relative mx-auto mt-14 max-w-4xl">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-24 -translate-x-1/2 sm:block"
        >
          <path
            d="M50 0 Q 62 125 50 250 T 50 500 T 50 750 T 50 1000"
            fill="none"
            stroke="hsl(var(--chocolate) / 0.55)"
            strokeWidth="1.25"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute left-6 top-0 h-full w-px sm:hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, hsl(var(--chocolate)/0.6) 0 8px, transparent 8px 16px)",
          }}
        />
        {timeline.map((item, index) => {
          const offset = index % 2 === 0 ? "sm:translate-x-[-1.5rem]" : "sm:translate-x-[1.5rem]";
          return (
            <div
              key={item.title}
              className={`relative mb-12 grid gap-6 sm:grid-cols-2 ${index % 2 ? "sm:text-left" : "sm:text-right"} animate-fade-in-slow`}
              style={{ animationDelay: `${index * 0.18}s` }}
            >
              <div className={index % 2 ? `sm:col-start-2 ${offset}` : offset}>
                <div className="paper-grain relative overflow-hidden border border-copper/25 bg-vellum p-6 shadow-[0_18px_48px_hsl(var(--moss-deep)/0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_hsl(var(--moss-deep)/0.2)]">
                  <div className={`flex items-center gap-3 ${index % 2 ? "" : "sm:justify-end"}`}>
                    <item.icon className="h-7 w-7 text-chocolate-glow" />
                    <span className="font-display text-5xl font-semibold text-chocolate">{item.time}</span>
                  </div>
                  <h3 className="mt-2 font-display text-3xl text-moss-deep">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </div>
              </div>
              <span className="absolute left-4 top-8 h-4 w-4 rounded-full border-[3px] border-background bg-chocolate shadow-[0_0_0_6px_hsl(var(--chocolate)/0.16)] sm:left-1/2 sm:-translate-x-1/2" />
            </div>
          );
        })}
      </div>
    </section>

    <WaveDivider fill="hsl(var(--moss-deep))" />

    <section id="details" className="bg-moss-deep py-20 text-primary-foreground">
      <div className="container mx-auto grid gap-5 px-6 md:grid-cols-3">
        <article className="border border-pearl/15 bg-pearl/10 p-6 backdrop-blur animate-fade-in hover:bg-pearl/20 hover:-translate-y-1 transition-all duration-300">
          <Sparkles className="h-7 w-7 text-copper-glow" />
          <h3 className="mt-5 font-display text-3xl">Aprangos kodas</h3>
          <p className="mt-3 text-pearl/75">Venkite baltos, šampano, smėlio ir kreminių tonų — šios spalvos rezervuotos jaunajai.</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <WomanIcon className="mt-1 h-9 w-9 text-copper-glow" />
              <div>
                <p className="font-display text-xl text-pearl">Moterys</p>
                <p className="mt-1 text-sm leading-6 text-pearl/70">Ilgos vakarinės suknelės — sodrūs, gilūs tonai.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ManIcon className="mt-1 h-9 w-9 text-copper-glow" />
              <div>
                <p className="font-display text-xl text-pearl">Vyrai</p>
                <p className="mt-1 text-sm leading-6 text-pearl/70">Kostiumai arba švarkai — klasikiniai, elegantiški.</p>
              </div>
            </div>
          </div>
        </article>
        <article className="border border-pearl/15 bg-pearl/10 p-6 backdrop-blur animate-fade-in hover:bg-pearl/20 hover:-translate-y-1 transition-all duration-300">
          <Gift className="h-7 w-7 text-copper-glow" />
          <h3 className="mt-5 font-display text-3xl">Dovanos</h3>
          <p className="mt-3 text-pearl/75">Jei norėsite mus pasveikinti, labiausiai džiaugsimės dovana vokelyje.</p>
        </article>
        <article className="border border-pearl/15 bg-pearl/10 p-6 backdrop-blur animate-fade-in hover:bg-pearl/20 hover:-translate-y-1 transition-all duration-300">
          <HeartHandshake className="h-7 w-7 text-copper-glow" />
          <h3 className="mt-5 font-display text-3xl">Dalyvavimas</h3>
          <p className="mt-3 text-pearl/75">Atsakymo lauksime iki liepos 6 d. Po šios datos registracija užsidarys.</p>
        </article>
      </div>
    </section>

    <WaveDivider flip fill="hsl(var(--moss-deep))" />

    <section id="map" className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display italic text-3xl uppercase tracking-[0.45em] text-copper">Kur susitiksime?</p>
        <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-copper to-transparent" />
      </div>
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
        <a className="group block overflow-hidden border border-border bg-vellum transition-all duration-300 hover:border-copper hover:-translate-y-1 hover:shadow-[0_22px_50px_hsl(var(--moss-deep)/0.2)] animate-fade-in" href="https://www.google.com/maps/search/?api=1&query=%C5%A0v.+Kazimiero+ba%C5%BEny%C4%8Dia+Vilnius" target="_blank" rel="noreferrer">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={churchPhoto} alt="Šv. Kazimiero bažnyčia" loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <MapPin className="h-6 w-6 text-copper" />
            <h3 className="mt-3 font-display text-3xl text-moss-deep group-hover:text-copper">Šv. Kazimiero bažnyčia</h3>
            <p className="text-muted-foreground">Didžioji g. 34, Vilnius</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-copper">Atidaryti žemėlapyje →</p>
          </div>
        </a>
        <a className="group block overflow-hidden border border-border bg-vellum transition-all duration-300 hover:border-copper hover:-translate-y-1 hover:shadow-[0_22px_50px_hsl(var(--moss-deep)/0.2)] animate-fade-in" href="https://www.google.com/maps/search/?api=1&query=Elven+restoranas+L.+Stuokos-Guceviciaus+9-1+Vilnius" target="_blank" rel="noreferrer">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={restaurantPhoto} alt="Restoranas Elven" loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <UtensilsCrossed className="h-6 w-6 text-copper" />
            <h3 className="mt-3 font-display text-3xl text-moss-deep group-hover:text-copper">Restoranas Elven</h3>
            <p className="text-muted-foreground">L. Stuokos-Gucevičiaus g. 9-1, Vilnius</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-copper">Atidaryti žemėlapyje →</p>
          </div>
        </a>
      </div>
    </section>

    <section id="faq" className="container mx-auto px-6 pb-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-display italic text-3xl uppercase tracking-[0.45em] text-copper">Klausimai</p>
        <div className="mt-8 divide-y divide-border border-y border-border bg-vellum">
          {[
            ["Kada atvykti?", "Į santuokos ceremoniją prašome atvykti 15 min. anksčiau."],
            ["Ar galima su vaikais?", "Į bažnyčią — taip, į vakarinę dalį restorane — ne, vakaras skirtas suaugusiems."],
            ["Iki kada atsakyti?", "Dalyvavimą prašome patvirtinti iki liepos 6 d."],
          ].map(([question, answer]) => (
            <details key={question} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-2xl text-moss-deep">
                {question}
                <Clock className="h-5 w-5 text-copper transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  </main>
);
