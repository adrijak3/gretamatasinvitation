import { useEffect, useMemo, useState } from "react";
import { AdminPanel } from "@/components/wedding/AdminPanel";
import { MusicPlayer } from "@/components/wedding/MusicPlayer";
import { OpeningLetter } from "@/components/wedding/OpeningLetter";
import { Petals } from "@/components/wedding/Petals";
import { RsvpForm } from "@/components/wedding/RsvpForm";
import { WeddingContent } from "@/components/wedding/WeddingContent";
import { supabase } from "@/integrations/supabase/client";

type Guest = {
  id: string;
  slug: string;
  display_name: string;
  greeting: string;
  partner_name: string | null;
  party_size: number;
};

const fallbackGuest: Guest = {
  id: "",
  slug: "mieli-sveciai",
  display_name: "Mieli svečiai",
  greeting: "Mieli svečiai,",
  partner_name: null,
  party_size: 2,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildGuestFromNames = (raw: string): Guest => {
  const firstNames = raw
    .split(/[,;|]/)
    .map((n) => n.trim().split(/\s+/)[0])
    .filter(Boolean)
    .slice(0, 4);
  const display = firstNames.join(" ir ") || "Mieli svečiai";
  const prefix =
    firstNames.length > 1
      ? "Mieli"
      : firstNames[0]?.endsWith("a") || firstNames[0]?.endsWith("ė")
      ? "Miela"
      : "Mielas";
  const greeting = firstNames.length ? `${prefix} ${firstNames.join(" ir ")},` : "Mieli svečiai,";
  return {
    id: "",
    slug: "n-" + (slugify(firstNames.join("-")) || "sveciai"),
    display_name: display,
    greeting,
    partner_name: firstNames[1] ?? null,
    party_size: Math.max(1, firstNames.length),
  };
};

const Index = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const namesParam = params.get("n") ?? "";
  const slug = params.get("s") || (namesParam ? buildGuestFromNames(namesParam).slug : "mieli-sveciai");
  const directToRsvp = typeof window !== "undefined" && window.location.hash === "#rsvp";
  const initialGuest = namesParam ? buildGuestFromNames(namesParam) : fallbackGuest;
  const [opened, setOpened] = useState(directToRsvp);
  const [guest, setGuest] = useState<Guest | null>(initialGuest);

  useEffect(() => {
    if (namesParam) {
      if (directToRsvp) {
        setTimeout(() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" }), 200);
      }
      return;
    }
    let alive = true;
    (supabase as any)
      .rpc("get_wedding_guest", { _slug: slug })
      .then(({ data }: { data: Guest[] | null }) => {
        if (!alive) return;
        setGuest(data?.[0] ?? fallbackGuest);
        if (directToRsvp) {
          setTimeout(() => document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" }), 200);
        }
      });
    return () => {
      alive = false;
    };
  }, [slug, directToRsvp, namesParam]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Petals />
      {!opened && <OpeningLetter greeting={guest?.greeting ?? fallbackGuest.greeting} onOpen={() => setOpened(true)} />}
      <MusicPlayer enabled={opened} />
      <WeddingContent />
      <RsvpForm guest={guest} fallbackSlug={slug} />
      <AdminPanel />
    </div>
  );
};

export default Index;