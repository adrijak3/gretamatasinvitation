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

export const RsvpForm = ({ guest, fallbackSlug }: RsvpFormProps) => {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [thanks, setThanks] = useState<null | "yes" | "no">(null);

  const deadline = new Date("2026-07-07T00:00:00+03:00");
  const isClosed = useMemo(() => Date.now() >= deadline.getTime(), []);

  // ✅ SAFE PARSER
  const prefill = useMemo(() => {
    if (typeof window === "undefined") return { guests: [] as { first: string; last: string }[] };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const parsePerson = (chunk: string) => {
      const clean = chunk.trim();
      if (!clean) return null;

      const [first, last] = clean.split("-").map((s) => s.trim());

      if (!first) return null;

      return { first, last: last ?? "" };
    };

    return {
      guests: raw
        .split(",")
        .map(parsePerson)
        .filter(Boolean) as { first: string; last: string }[],
    };
  }, []);

  const guests = prefill.guests;

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

    const payload = {
      slug: guest?.slug ?? fallbackSlug,

      first_name: String(form.get("firstName_0") ?? "").trim(),
      last_name: String(form.get("lastName_0") ?? "").trim(),

      partner_first_name: String(form.get("firstName_1") ?? "").trim(),
      partner_last_name: String(form.get("lastName_1") ?? "").trim(),

      meal_choice: String(form.get("mealChoice_0") ?? ""),
      partner_meal_choice: String(form.get("mealChoice_1") ?? ""),

      dietary_notes: String(form.get("dietaryNotes_0") ?? ""),
      partner_dietary_notes: String(form.get("dietaryNotes_1") ?? ""),

      attending,
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
    <section className="relative overflow-hidden bg-vellum py-20">
      <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT */}
        <div>
          <h2 className="font-display text-5xl text-moss-deep">
            Dalyvavimo patvirtinimas
          </h2>
        </div>

        {/* FORM */}
        <form onSubmit={submit} className="grid gap-5 border bg-pearl p-6">

          {/* ATTENDANCE */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => setAttending(true)}>
              Dalyvausiu
            </Button>
            <Button type="button" onClick={() => setAttending(false)}>
              Negalėsiu
            </Button>
          </div>

          {/* GUESTS */}
          {attending === true &&
            guests.map((g, idx) => (
              <div key={idx} className="grid gap-4 border p-4">

                <div className="grid gap-4 sm:grid-cols-2">

                  <label>
                    Vardas
                    <input
                      name={`firstName_${idx}`}
                      defaultValue={g.first}
                      required
                      className="border px-4 py-3"
                    />
                  </label>

                  <label>
                    Pavardė
                    <input
                      name={`lastName_${idx}`}
                      defaultValue={g.last}
                      required
                      className="border px-4 py-3"
                    />
                  </label>

                </div>

                <label>
                  Meniu pasirinkimas
                  <select name={`mealChoice_${idx}`} className="border px-4 py-3">
                    <option value="">Pasirinkti</option>
                    <option value="mesa">Mėsos</option>
                    <option value="zuvis">Žuvies</option>
                    <option value="vegetariskas">Vegetariškas</option>
                  </select>
                </label>

                <label>
                  Alergijos / pastabos
                  <textarea
                    name={`dietaryNotes_${idx}`}
                    rows={2}
                    className="border px-4 py-3"
                  />
                </label>

              </div>
            ))}

          {/* MESSAGE */}
          {attending !== null && (
            <textarea
              name="message"
              placeholder="Žinutė jauniesiems..."
              className="border px-4 py-3"
            />
          )}

          {/* SUBMIT */}
          {attending !== null && (
            <Button type="submit">
              {saving ? "Saugoma..." : "Siųsti"}
            </Button>
          )}

        </form>
      </div>

      {/* THANK YOU */}
      <Dialog open={thanks !== null} onOpenChange={(o) => !o && setThanks(null)}>
        <DialogContent className="text-center">
          <Heart className="mx-auto" />
          <DialogTitle>
            {thanks === "yes" ? "Ačiū!" : "Ačiū!"}
          </DialogTitle>
          <DialogDescription />
        </DialogContent>
      </Dialog>
    </section>
  );
};
