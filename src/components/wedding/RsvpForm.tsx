import { FormEvent, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

/* ================= NAME SPLIT ================= */
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

  /* ================= PREFILL ================= */
  const prefill = useMemo(() => {
    if (typeof window === "undefined")
      return { first: "", partnerFirst: "" };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const firsts = raw
      .split(/[,;|]/)
      .map((n) => n.trim().split(/\s+/)[0])
      .filter(Boolean);

    return {
      first: firsts[0] ?? "",
      partnerFirst: firsts[1] ?? "",
    };
  }, []);

  const isCouple = !!prefill.partnerFirst;

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
      partner_dietary_notes: String(form.get("partnerDietaryNotes") ?? ""),

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
        console.warn(e);
      }
    }

    setThanks(attending ? "yes" : "no");
  };

  return (
    <section id="rsvp" className="relative overflow-hidden bg-vellum py-20">

      <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">

        <div>
          <h2 className="font-display text-5xl font-semibold text-moss-deep">
            Dalyvavimo patvirtinimas
          </h2>
        </div>

        <form onSubmit={submit} className="paper-grain grid gap-5 border bg-pearl p-6">

          {/* ATTENDANCE */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => setAttending(true)}>
              Dalyvausiu
            </Button>
            <Button type="button" onClick={() => setAttending(false)}>
              Negalėsiu dalyvauti
            </Button>
          </div>

          {/* ================= GUEST 1 ================= */}
          {attending === true && (
            <div className="grid gap-4 border p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Vardas / Pavardė
                  <input
                    name="firstName"
                    defaultValue={prefill.first}
                    className="border px-4 py-3"
                  />
                </label>

                <label>
                  Pavardė
                  <input
                    name="lastName"
                    className="border px-4 py-3"
                  />
                </label>
              </div>

              <label>
                Meniu pasirinkimas
                <select name="mealChoice" className="border px-4 py-3">
                  <option value="">Pasirinkti</option>
                  <option value="mesa">Mėsos</option>
                  <option value="zuvis">Žuvies</option>
                  <option value="vegetariskas">Vegetariškas</option>
                </select>
              </label>

              <label>
                Alergijos / maisto pasirinkimai
                <textarea name="dietaryNotes" rows={2} className="border px-4 py-3" />
              </label>
            </div>
          )}

          {/* ================= GUEST 2 ================= */}
          {attending === true && isCouple && (
            <div className="grid gap-4 border p-5">

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  Vardas
                  <input
                    name="partnerFirstName"
                    defaultValue={prefill.partnerFirst}
                    className="border px-4 py-3"
                  />
                </label>

                <label>
                  Pavardė
                  <input
                    name="partnerLastName"
                    className="border px-4 py-3"
                  />
                </label>
              </div>

              <label>
                Meniu pasirinkimas
                <select name="partnerMealChoice" className="border px-4 py-3">
                  <option value="">Pasirinkti</option>
                  <option value="mesa">Mėsos</option>
                  <option value="zuvis">Žuvies</option>
                  <option value="vegetariskas">Vegetariškas</option>
                </select>
              </label>

              <label>
                Alergijos / maisto pasirinkimai
                <textarea name="partnerDietaryNotes" rows={2} className="border px-4 py-3" />
              </label>
            </div>
          )}

          {/* MESSAGE */}
          {attending !== null && (
            <textarea name="message" className="border px-4 py-3" />
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
          <div className="mx-auto h-16 w-16 rounded-full bg-copper/15 grid place-items-center">
            <Heart />
          </div>

          <DialogTitle className="font-display text-3xl text-moss-deep">
            Ačiū!
          </DialogTitle>

          <DialogDescription />
        </DialogContent>
      </Dialog>

    </section>
  );
};
