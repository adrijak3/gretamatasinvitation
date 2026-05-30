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

export const RsvpForm = ({ guest, fallbackSlug }: RsvpFormProps) => {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [thanks, setThanks] = useState<null | "yes" | "no">(null);

  const isClosed = useMemo(
    () => Date.now() >= deadline.getTime(),
    []
  );

  // 💎 CLEAN PARSER (Name/Surname format)
  const prefill = useMemo(() => {
    if (typeof window === "undefined")
      return { guest1: null, guest2: null };

    const raw = new URLSearchParams(window.location.search).get("n") ?? "";

    const parsePerson = (chunk: string) => {
      const clean = chunk.trim();
      if (!clean) return null;

      const [first, last] = clean.split("/").map((s) => s.trim());
      if (!first) return null;

      return {
        fullName: `${first} ${last ?? ""}`.trim(),
        first,
        last: last ?? "",
      };
    };

    const parts = raw
      .split(",")
      .map(parsePerson)
      .filter(Boolean) as any[];

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

    const firstFullName = String(form.get("firstFullName") ?? "").trim();
    const partnerFullName = String(form.get("partnerFullName") ?? "").trim();

    const [first_name = "", last_name = ""] = firstFullName.split(" ");
    const [partner_first_name = "", partner_last_name = ""] =
      partnerFullName.split(" ");

    const payload = {
      slug: guest?.slug ?? fallbackSlug,

      first_name,
      last_name,
      partner_first_name,
      partner_last_name,

      meal_choice: String(form.get("mealChoice") ?? ""),
      partner_meal_choice: String(form.get("partnerMealChoice") ?? ""),

      dietary_notes: String(form.get("dietaryNotes") ?? ""),

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
        console.warn(e);
      }
    }

    setThanks(attending ? "yes" : "no");
  };

  const isCouple = !!prefill.guest2;

  return (
    <section className="relative overflow-hidden bg-vellum py-20">
      <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT SIDE */}
        <div>
          <h2 className="font-display text-5xl font-semibold leading-none text-moss-deep sm:text-6xl">
            Dalyvavimo patvirtinimas
          </h2>

          <p className="mt-6 text-muted-foreground leading-8">
            Atsakymo lauksime iki{" "}
            <strong className="text-moss-deep">2026 m. liepos 6 d.</strong>
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={submit}
          className="paper-grain relative grid gap-8 border border-copper/25 bg-pearl p-6 sm:p-8 shadow-[0_28px_70px_hsl(var(--moss-deep)/0.14)]"
        >

          {/* ATTENDANCE */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => setAttending(true)}>
              Dalyvausiu
            </Button>
            <Button type="button" onClick={() => setAttending(false)}>
              Negalėsiu dalyvauti
            </Button>
          </div>

          {/* GUEST 1 CARD */}
          {attending === true && (
            <div className="grid gap-5 border border-copper/20 bg-background/40 p-6 rounded-xl">
              <p className="font-display text-xl text-moss-deep">
                Svečias
              </p>

              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Vardas Pavardė
                <input
                  name="firstFullName"
                  defaultValue={prefill.guest1?.fullName ?? ""}
                  className="border border-input bg-background px-4 py-3 font-body"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Meniu pasirinkimas
                <select
                  name="mealChoice"
                  className="border border-input bg-background px-4 py-3 font-body"
                >
                  <option value="">Pasirinkti</option>
                  <option value="mesa">Mėsos patiekalas</option>
                  <option value="zuvis">Žuvies patiekalas</option>
                  <option value="vegetariskas">Vegetariškas</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Alergijos / pastabos
                <textarea
                  name="dietaryNotes"
                  rows={2}
                  className="border border-input bg-background px-4 py-3 font-body"
                />
              </label>
            </div>
          )}

          {/* GUEST 2 CARD */}
          {attending === true && isCouple && (
            <div className="grid gap-5 border border-copper/20 bg-background/40 p-6 rounded-xl">
              <p className="font-display text-xl text-moss-deep">
                Antras svečias
              </p>

              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Vardas Pavardė
                <input
                  name="partnerFullName"
                  defaultValue={prefill.guest2?.fullName ?? ""}
                  className="border border-input bg-background px-4 py-3 font-body"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                Meniu pasirinkimas
                <select
                  name="partnerMealChoice"
                  className="border border-input bg-background px-4 py-3 font-body"
                >
                  <option value="">Pasirinkti</option>
                  <option value="mesa">Mėsos patiekalas</option>
                  <option value="zuvis">Žuvies patiekalas</option>
                  <option value="vegetariskas">Vegetariškas</option>
                </select>
              </label>
            </div>
          )}

          {/* MESSAGE */}
          {attending !== null && (
            <label className="grid gap-2 text-sm font-semibold text-moss-deep">
              Žinutė jauniesiems
              <textarea
                name="message"
                rows={4}
                className="border border-input bg-background px-4 py-3 font-body"
              />
            </label>
          )}

          {/* SUBMIT */}
          {attending !== null && (
            <Button type="submit" variant="invitation" size="lg">
              {saving ? "Saugoma..." : "Išsiųsti atsakymą"}
            </Button>
          )}
        </form>
      </div>

      {/* THANK YOU */}
      <Dialog open={thanks !== null} onOpenChange={(o) => !o && setThanks(null)}>
        <DialogContent className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-copper/15">
            <Heart className="h-8 w-8 text-copper" />
          </div>

          <DialogTitle className="font-display text-3xl text-moss-deep">
            {thanks === "yes" ? "Ačiū, kad būsite kartu!" : "Ačiū, kad pranešėte!"}
          </DialogTitle>

          <DialogDescription className="text-muted-foreground" />
        </DialogContent>
      </Dialog>
    </section>
  );
};
