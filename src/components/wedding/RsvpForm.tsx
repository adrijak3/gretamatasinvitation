import { FormEvent, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_SHEETS_WEBHOOK_URL } from "@/config/integrations";

type Guest = {
  id: string;
  slug: string;
  display_name: string;
  greeting: string;
  partner_name: string | null;
  party_size: number;
};

type RsvpFormProps = {
  guest: Guest | null;
  fallbackSlug: string;
};

const deadline = new Date("2026-07-07T00:00:00+03:00");

/* ================= FIXED PARSER ================= */
const splitName = (full: string | null | undefined) => {
  const value = (full ?? "").trim();
  if (!value) return { first: "", last: "" };
  const parts = value.split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
};

export const RsvpForm = ({ guest, fallbackSlug }: RsvpFormProps) => {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [thanks, setThanks] = useState<null | "yes" | "no">(null);

  const isClosed = useMemo(() => Date.now() >= deadline.getTime(), []);

  /* ================= FIXED PREFILL ================= */
  const prefill = useMemo(() => {
    if (typeof window === "undefined")
      return { first: "", last: "", partnerFirst: "", partnerLast: "" };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const parse = (chunk: string) => {
      const clean = chunk.trim();
      if (!clean) return { first: "", last: "" };

      const [first, last] = clean.split("/").map((s) => s.trim());
      return { first: first ?? "", last: last ?? "" };
    };

    const parts = raw.split(",").map(parse);

    return {
      first: parts[0]?.first ?? "",
      last: parts[0]?.last ?? "",
      partnerFirst: parts[1]?.first ?? "",
      partnerLast: parts[1]?.last ?? "",
      hasPartner: !!parts[1]?.first,
    };
  }, []);

  const isCouple = prefill.hasPartner;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (attending === null) {
      toast.error("Pasirinkite, ar dalyvausite.");
      return;
    }

    if (isClosed) {
      toast.error("Registracija jau uždaryta.");
      return;
    }

    const form = new FormData(event.currentTarget);

    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();

    const partnerFirstName = String(form.get("partnerFirstName") ?? "").trim();
    const partnerLastName = String(form.get("partnerLastName") ?? "").trim();

    const payload = {
      slug: guest?.slug ?? fallbackSlug,

      first_name: firstName,
      last_name: lastName,

      partner_first_name: partnerFirstName,
      partner_last_name: partnerLastName,

      attending,
      meal_choice: String(form.get("mealChoice") ?? ""),
      partner_meal_choice: String(form.get("partnerMealChoice") ?? ""),
      dietary_notes: String(form.get("dietaryNotes") ?? ""),
      message: String(form.get("message") ?? ""),

      submitted_at: new Date().toISOString(),
    };

    setSaving(true);

    const usePublic = !guest?.id;

    const { error } = usePublic
      ? await (supabase as any).rpc("submit_public_wedding_rsvp", {
          _slug: payload.slug,
          _display_name: guest?.display_name ?? "Svečias",
          _greeting: guest?.greeting ?? "Mieli svečiai,",
          _party_size: guest?.party_size ?? 1,

          _first_name: payload.first_name,
          _last_name: payload.last_name,

          _partner_first_name: payload.partner_first_name,
          _partner_last_name: payload.partner_last_name,

          _attending: payload.attending,
          _meal_choice: payload.meal_choice,
          _partner_meal_choice: payload.partner_meal_choice,
          _dietary_notes: payload.dietary_notes,
          _message: payload.message,
        })
      : await (supabase as any).rpc("submit_wedding_rsvp", {
          _slug: payload.slug,
          _first_name: payload.first_name,
          _last_name: payload.last_name,
          _partner_first_name: payload.partner_first_name,
          _partner_last_name: payload.partner_last_name,
          _attending: payload.attending,
          _meal_choice: payload.meal_choice,
          _partner_meal_choice: payload.partner_meal_choice,
          _dietary_notes: payload.dietary_notes,
          _message: payload.message,
        });

    setSaving(false);

    if (error) {
      toast.error(
        error.message.includes("RSVP_CLOSED")
          ? "Registracija jau uždaryta."
          : "Nepavyko išsaugoti atsakymo."
      );
      return;
    }

    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.warn("Webhook error:", e);
      }
    }

    setThanks(attending ? "yes" : "no");
  };

  return (
    <section id="rsvp" className="relative overflow-hidden bg-vellum py-20">

      <div className="container relative mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

        <div>
          <h2 className="font-display text-5xl font-semibold leading-none text-moss-deep sm:text-6xl">
            Dalyvavimo patvirtinimas
          </h2>

          <p className="mt-6 leading-8 text-muted-foreground">
            Atsakymo lauksime iki <strong className="font-semibold text-moss-deep">2026 m. liepos 6 d.</strong>
          </p>
        </div>

        <form onSubmit={submit} className="paper-grain relative grid gap-5 border border-copper/25 bg-pearl p-6 shadow-[0_28px_70px_hsl(var(--moss-deep)/0.14)] sm:p-8">

          <fieldset disabled={isClosed || saving} className="grid gap-5 disabled:opacity-60">

            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant={attending === true ? "moss" : "vellum"} onClick={() => setAttending(true)}>
                Dalyvausiu
              </Button>
              <Button type="button" variant={attending === false ? "moss" : "vellum"} onClick={() => setAttending(false)}>
                Negalėsiu dalyvauti
              </Button>
            </div>

            {attending === true && (
              <div className="grid gap-5 animate-fade-in">

                {/* GUEST 1 */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                    Vardas
                    <input
                      name="firstName"
                      defaultValue={`${prefill.first} ${prefill.last}`.trim()}
                      className="border border-input bg-background px-4 py-3 font-body text-foreground"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                    Pavardė
                    <input
                      name="lastName"
                      defaultValue=""
                      className="border border-input bg-background px-4 py-3 font-body text-foreground"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                  Meniu pasirinkimas
                  <select name="mealChoice" className="border border-input bg-background px-4 py-3 font-body text-foreground">
                    <option value="">Pasirinkti</option>
                    <option value="mesa">Mėsos patiekalas</option>
                    <option value="zuvis">Žuvies patiekalas</option>
                    <option value="vegetariskas">Vegetariškas</option>
                  </select>
                </label>

                {/* GUEST 2 ONLY IF EXISTS */}
                {isCouple && (
                  <>
                    <div className="my-2 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

                    <p className="font-display text-xl text-moss-deep">
                      Antras svečias
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                        Vardas
                        <input
                          name="partnerFirstName"
                          defaultValue={prefill.partnerFirst}
                          className="border border-input bg-background px-4 py-3 font-body text-foreground"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                        Pavardė
                        <input
                          name="partnerLastName"
                          defaultValue={prefill.partnerLast}
                          className="border border-input bg-background px-4 py-3 font-body text-foreground"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                      Meniu pasirinkimas
                      <select name="partnerMealChoice" className="border border-input bg-background px-4 py-3 font-body text-foreground">
                        <option value="">Pasirinkti</option>
                        <option value="mesa">Mėsos patiekalas</option>
                        <option value="zuvis">Žuvies patiekalas</option>
                        <option value="vegetariskas">Vegetariškas</option>
                      </select>
                    </label>
                  </>
                )}

                <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                  Alergijos
                  <textarea name="dietaryNotes" rows={3} className="border border-input bg-background px-4 py-3 font-body text-foreground" />
                </label>

              </div>
            )}

            {attending !== null && (
              <label className="grid gap-2 text-sm font-semibold text-moss-deep animate-fade-in">
                Žinutė jauniesiems
                <textarea name="message" rows={4} className="border border-input bg-background text-foreground px-4 py-3 font-body" />
              </label>
            )}

            {attending !== null && (
              <Button type="submit" variant="invitation" size="lg" className="animate-fade-in">
                {saving ? "Saugoma..." : isClosed ? "Registracija uždaryta" : "Išsiųsti atsakymą"}
              </Button>
            )}

          </fieldset>
        </form>
      </div>

      <Dialog open={thanks !== null} onOpenChange={(o) => !o && setThanks(null)}>
        <DialogContent className="border-copper/30 bg-pearl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-copper/15 text-copper animate-scale-in">
            <Heart className="h-8 w-8" />
          </div>

          <DialogTitle className="font-display text-3xl text-moss-deep">
            {thanks === "yes" ? "Ačiū, kad būsite kartu!" : "Ačiū, kad pranešėte!"}
          </DialogTitle>

          <DialogDescription className="text-base leading-7 text-muted-foreground" />
        </DialogContent>
      </Dialog>

    </section>
  );
};
