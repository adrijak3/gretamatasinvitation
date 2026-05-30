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

  // ✅ FIXED PARSER (Name/Surname format)
  const prefill = useMemo(() => {
    if (typeof window === "undefined") return { guest1: null, guest2: null };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const parsePerson = (chunk: string) => {
      const clean = chunk.trim();
      if (!clean) return null;

      const [first, last] = clean.split("/").map((s) => s.trim());

      if (!first) return null;

      return {
        first,
        last: last ?? "",
      };
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

  const isCouple = !!prefill.guest2;

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

      first_name: String(form.get("firstName") ?? "").trim(),
      last_name: String(form.get("lastName") ?? "").trim(),

      partner_first_name: String(form.get("partnerFirstName") ?? "").trim(),
      partner_last_name: String(form.get("partnerLastName") ?? "").trim(),

      meal_choice: String(form.get("mealChoice") ?? ""),
      partner_meal_choice: String(form.get("partnerMealChoice") ?? ""),

      dietary_notes: String(form.get("dietaryNotes") ?? ""),
      message: String(form.get("message") ?? ""),

      attending,

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
        console.warn(e);
      }
    }

    setThanks(attending ? "yes" : "no");
  };

  return (
    <section className="relative overflow-hidden bg-vellum py-20">
      <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">

        <div>
          <h2 className="font-display text-5xl text-moss-deep">
            Dalyvavimo patvirtinimas
          </h2>
        </div>

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

          {/* GUEST 1 */}
          {attending === true && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                Vardas
                <input
                  name="firstName"
                  defaultValue={prefill.guest1?.first ?? ""}
                  required
                />
              </label>

              <label>
                Pavardė
                <input
                  name="lastName"
                  defaultValue={prefill.guest1?.last ?? ""}
                  required
                />
              </label>
            </div>
          )}

          {/* GUEST 2 (ONLY IF EXISTS) */}
          {attending === true && isCouple && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Vardas
                  <input
                    name="partnerFirstName"
                    defaultValue={prefill.guest2?.first ?? ""}
                    required
                  />
                </label>

                <label>
                  Pavardė
                  <input
                    name="partnerLastName"
                    defaultValue={prefill.guest2?.last ?? ""}
                    required
                  />
                </label>
              </div>
            </>
          )}

          {/* MENU */}
          {attending === true && (
            <label>
              Meniu pasirinkimas
              <select name="mealChoice">
                <option value="">Pasirinkti</option>
                <option value="mesa">Mėsos</option>
                <option value="zuvis">Žuvies</option>
                <option value="vegetariskas">Vegetariškas</option>
              </select>
            </label>
          )}

          {/* ALLERGIES */}
          {attending === true && (
            <textarea name="dietaryNotes" placeholder="Alergijos / pastabos" />
          )}

          {/* MESSAGE */}
          {attending !== null && (
            <textarea name="message" placeholder="Žinutė jauniesiems..." />
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
