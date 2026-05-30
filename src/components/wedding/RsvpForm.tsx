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

export const RsvpForm = ({ guest, fallbackSlug }: RsvpFormProps) => {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [thanks, setThanks] = useState<null | "yes" | "no">(null);

  const isClosed = useMemo(() => Date.now() >= deadline.getTime(), []);

  // 👉 NEW: full name + surname parsing
  const prefill = useMemo(() => {
    if (typeof window === "undefined") return { guest1: null, guest2: null };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const parsePerson = (chunk: string) => {
      const [first, last] = chunk.split("&").map((s) => s.trim());
      if (!first) return null;
      return { first, last: last ?? "" };
    };

    const parts = raw
      .split(",")
      .map(parsePerson)
      .filter(Boolean) as { first: string; last: string }[];

    return {
      guest1: parts[0] ?? null,
      guest2: parts[1] ?? null,
    };
  }, []);

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

    const partnerFirst = String(form.get("partnerFirstName") ?? "").trim();
    const partnerLast = String(form.get("partnerLastName") ?? "").trim();

    if (attending && (!firstName || !lastName)) {
      toast.error("Įrašykite vardą ir pavardę.");
      return;
    }

    const payload = {
      slug: guest?.slug ?? fallbackSlug,

      first_name: firstName,
      last_name: lastName,

      partner_first_name: partnerFirst,
      partner_last_name: partnerLast,

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
        console.warn("Google Sheets webhook nepavyko:", e);
      }
    }

    setThanks(attending ? "yes" : "no");
  };

  const guests = [prefill.guest1, prefill.guest2].filter(Boolean);

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

        <form onSubmit={submit} className="paper-grain relative grid gap-5 border border-copper/25 bg-pearl p-6 sm:p-8">

          <fieldset disabled={isClosed || saving} className="grid gap-5 disabled:opacity-60">

            {/* Attendance */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant={attending === true ? "moss" : "vellum"} onClick={() => setAttending(true)}>
                Dalyvausiu
              </Button>
              <Button type="button" variant={attending === false ? "moss" : "vellum"} onClick={() => setAttending(false)}>
                Negalėsiu dalyvauti
              </Button>
            </div>

            {/* Guests (dynamic) */}
            {attending === true &&
              guests.map((g, idx) => (
                <div key={idx} className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                    Vardas
                    <input
                      name={idx === 0 ? "firstName" : "partnerFirstName"}
                      required
                      defaultValue={g?.first}
                      className="border border-input bg-background px-4 py-3"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                    Pavardė
                    <input
                      name={idx === 0 ? "lastName" : "partnerLastName"}
                      required
                      defaultValue={g?.last}
                      className="border border-input bg-background px-4 py-3"
                    />
                  </label>
                </div>
              ))}

            {attending === true && (
              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Meniu pasirinkimas
                <select name="mealChoice" className="border border-input bg-background px-4 py-3">
                  <option value="">Pasirinkti</option>
                  <option value="mesa">Mėsos patiekalas</option>
                  <option value="zuvis">Žuvies patiekalas</option>
                  <option value="vegetariskas">Vegetariškas</option>
                </select>
              </label>
            )}

            {attending !== null && (
              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Žinutė jauniesiems
                <textarea name="message" rows={4} className="border border-input bg-background px-4 py-3" />
              </label>
            )}

            {attending !== null && (
              <Button type="submit" variant="invitation" size="lg">
                {saving ? "Saugoma..." : isClosed ? "Registracija uždaryta" : "Išsiųsti atsakymą"}
              </Button>
            )}
          </fieldset>
        </form>
      </div>

      <Dialog open={thanks !== null} onOpenChange={(o) => !o && setThanks(null)}>
        <DialogContent className="bg-pearl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-copper/15">
            <Heart className="h-8 w-8" />
          </div>

          <DialogTitle className="font-display text-3xl text-moss-deep">
            {thanks === "yes" ? "Ačiū, kad būsite kartu!" : "Ačiū, kad pranešėte!"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            {thanks === "yes" ? "Iki greito susitikimo!" : ""}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </section>
  );
};
