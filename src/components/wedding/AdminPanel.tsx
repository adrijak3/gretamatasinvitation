import { FormEvent, useEffect, useState } from "react";
import { Flower2, Link2, LockKeyhole, MailCheck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type GuestRow = {
  id: string;
  slug: string;
  display_name: string;
  greeting: string;
  partner_name: string | null;
  party_size: number;
  notes: string | null;
};

type RsvpRow = {
  id: string;
  guest_display_name: string;
  first_name: string;
  last_name: string;
  partner_first_name: string | null;
  partner_last_name: string | null;
  attending: boolean;
  meal_choice: string | null;
  partner_meal_choice: string | null;
  dietary_notes: string | null;
  message: string | null;
};

const emptyGuest = {
  id: "",
  slug: "",
  display_name: "",
  greeting: "",
  partner_name: "",
  party_size: 1,
  notes: "",
};

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const AdminPanel = () => {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => sessionStorage.getItem("wedding-admin-token") ?? "");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [editing, setEditing] = useState(emptyGuest);
  const [loading, setLoading] = useState(false);

  const baseUrl = "https://gretamatasvestuves.lovable.app/";

  const load = async (activeToken = token) => {
    if (!activeToken) return;
    const [{ data: guestData, error: guestError }, { data: rsvpData, error: rsvpError }] = await Promise.all([
      (supabase as any).rpc("admin_list_wedding_guests", { _token: activeToken }),
      (supabase as any).rpc("admin_list_wedding_rsvps", { _token: activeToken }),
    ]);
    if (guestError || rsvpError) {
      toast.error("Admin seansas baigėsi arba slaptažodis neteisingas.");
      sessionStorage.removeItem("wedding-admin-token");
      setToken("");
      return;
    }
    setGuests(guestData ?? []);
    setRsvps(rsvpData ?? []);
  };

  useEffect(() => {
    if (open && token) load();
  }, [open]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setLoading(true);
    const { data, error } = await (supabase as any).rpc("create_wedding_admin_session", { _password: password });
    setLoading(false);
    if (error || !data) {
      toast.error("Neteisingas slaptažodis.");
      return;
    }
    sessionStorage.setItem("wedding-admin-token", data);
    setToken(data);
    await load(data);
  };

  const saveGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    const { error } = await (supabase as any).rpc("admin_save_wedding_guest", {
      _token: token,
      _id: editing.id || null,
      _slug: editing.slug || makeSlug(editing.display_name),
      _display_name: editing.display_name,
      _greeting: editing.greeting,
      _partner_name: editing.partner_name,
      _party_size: Number(editing.party_size),
      _notes: editing.notes,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Tokia nuoroda jau yra." : "Nepavyko išsaugoti svečio.");
      return;
    }
    toast.success("Svečias išsaugotas.");
    setEditing(emptyGuest);
    await load();
  };

  const deleteGuest = async (id: string) => {
    if (!token) return;
    const { error } = await (supabase as any).rpc("admin_delete_wedding_guest", { _token: token, _id: id });
    if (error) {
      toast.error("Nepavyko ištrinti.");
      return;
    }
    await load();
  };

  const firstNamesFor = (g: GuestRow) => {
    const first = (g.display_name || "").trim().split(/\s+/)[0] || "";
    const partnerFirst = (g.partner_name || "").trim().split(/\s+/)[0] || "";
    return [first, partnerFirst].filter(Boolean).join(",");
  };

  const copyLink = async (guest: GuestRow) => {
    const names = firstNamesFor(guest);
    const url = names
      ? `${baseUrl}?n=${encodeURIComponent(names)}`
      : `${baseUrl}?s=${encodeURIComponent(guest.slug)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Nuoroda nukopijuota.");
  };

  const copyRsvpLink = async (guest: GuestRow) => {
    const names = firstNamesFor(guest);
    const url = names
      ? `${baseUrl}?n=${encodeURIComponent(names)}#rsvp`
      : `${baseUrl}?s=${encodeURIComponent(guest.slug)}#rsvp`;
    await navigator.clipboard.writeText(url);
    toast.success("RSVP nuoroda nukopijuota.");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-5 bottom-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-copper/30 bg-vellum/90 text-copper shadow-[0_12px_36px_hsl(var(--moss-deep)/0.2)] backdrop-blur transition-transform hover:scale-105 active:scale-95"
        aria-label="Atidaryti paslėptą meniu"
      >
        <Flower2 className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-moss-deep/80 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-6xl border border-copper/30 bg-background shadow-[0_30px_90px_hsl(var(--moss-deep)/0.45)]">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <p className="font-display italic text-2xl uppercase tracking-[0.4em] text-copper">Slaptas meniu</p>
                <h2 className="font-display text-4xl text-moss-deep">Svečiai ir RSVP</h2>
              </div>
              <Button type="button" variant="vellum" onClick={() => setOpen(false)}>Uždaryti</Button>
            </div>

            {!token ? (
              <form onSubmit={login} className="mx-auto grid max-w-md gap-4 p-8">
                <LockKeyhole className="h-8 w-8 text-copper" />
                <label className="grid gap-2 text-sm font-semibold text-moss-deep">
                  Slaptas slaptažodis
                  <input name="password" type="password" className="border border-input bg-vellum px-4 py-3 text-foreground" />
                </label>
                <Button type="submit" variant="invitation" disabled={loading}>{loading ? "Tikrinama..." : "Prisijungti"}</Button>
              </form>
            ) : (
              <div className="grid gap-8 p-5 lg:grid-cols-[0.85fr_1.15fr]">
                <form onSubmit={saveGuest} className="paper-grain grid gap-4 border border-copper/25 bg-vellum p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-3xl text-moss-deep">{editing.id ? "Redaguoti svečią" : "Naujas svečias"}</h3>
                    <Button type="button" variant="vellum" size="sm" onClick={() => setEditing(emptyGuest)}><Plus className="h-4 w-4" /> Naujas</Button>
                  </div>
                  <input placeholder="Vardas / svečiai" value={editing.display_name} onChange={(event) => setEditing({ ...editing, display_name: event.target.value, slug: editing.slug || makeSlug(event.target.value) })} className="border border-input bg-background px-4 py-3 text-foreground" required />
                  <input placeholder="Pilnas kreipinys, pvz. Miela Greta," value={editing.greeting} onChange={(event) => setEditing({ ...editing, greeting: event.target.value })} className="border border-input bg-background px-4 py-3 text-foreground" required />
                  <input placeholder="Nuorodos kodas" value={editing.slug} onChange={(event) => setEditing({ ...editing, slug: makeSlug(event.target.value) })} className="border border-input bg-background px-4 py-3 text-foreground" required />
                  <input placeholder="Antro svečio vardas, jei yra" value={editing.partner_name ?? ""} onChange={(event) => setEditing({ ...editing, partner_name: event.target.value, party_size: event.target.value ? 2 : editing.party_size })} className="border border-input bg-background px-4 py-3 text-foreground" />
                  <select value={editing.party_size} onChange={(event) => setEditing({ ...editing, party_size: Number(event.target.value) })} className="border border-input bg-background px-4 py-3 text-foreground">
                    <option value={1}>1 asmuo</option>
                    <option value={2}>2 asmenys</option>
                    <option value={3}>3 asmenys</option>
                    <option value={4}>4 asmenys</option>
                  </select>
                  <textarea placeholder="Pastabos" value={editing.notes ?? ""} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} className="border border-input bg-background px-4 py-3 text-foreground" />
                  <Button type="submit" variant="moss" disabled={loading}>{loading ? "Saugoma..." : "Išsaugoti"}</Button>
                </form>

                <div className="grid gap-6">
                  <div>
                    <h3 className="font-display text-3xl text-moss-deep">Svečių nuorodos</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Nuorodos automatiškai kuriamos per publikuotą svetainę.</p>
                    <div className="mt-3 grid max-h-[360px] gap-3 overflow-auto pr-1">
                      {guests.map((guest) => (
                        <div key={guest.id} className="grid gap-3 border border-border bg-vellum p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="truncate font-display text-2xl text-moss-deep">{guest.display_name}</p>
                            <p className="truncate text-sm text-muted-foreground">{firstNamesFor(guest) ? `${baseUrl}?n=${encodeURIComponent(firstNamesFor(guest))}` : `${baseUrl}?s=${encodeURIComponent(guest.slug)}`}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="vellum" size="sm" onClick={() => copyLink(guest)} title="Kvietimo nuoroda"><Link2 className="h-4 w-4" /></Button>
                            <Button type="button" variant="vellum" size="sm" onClick={() => copyRsvpLink(guest)} title="RSVP nuoroda (vardas + auto-užpildymas)"><MailCheck className="h-4 w-4" /></Button>
                            <Button type="button" variant="moss" size="sm" onClick={() => setEditing({ ...guest, partner_name: guest.partner_name ?? "", notes: guest.notes ?? "" })}>Keisti</Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => deleteGuest(guest.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-3xl text-moss-deep">RSVP atsakymai</h3>
                    <div className="mt-3 grid max-h-[360px] gap-3 overflow-auto pr-1">
                      {rsvps.length === 0 && <p className="border border-border bg-vellum p-4 text-muted-foreground">Atsakymų dar nėra.</p>}
                      {rsvps.map((rsvp) => (
                        <div key={rsvp.id} className="border border-border bg-vellum p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-display text-2xl text-moss-deep">{rsvp.first_name} {rsvp.last_name}</p>
                            <span className="rounded-full bg-moss px-3 py-1 text-xs font-semibold uppercase tracking-widest text-moss-foreground">{rsvp.attending ? "Dalyvaus" : "Nedalyvaus"}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">Kvietimas: {rsvp.guest_display_name}</p>
                          {(rsvp.partner_first_name || rsvp.partner_last_name) && <p className="text-sm text-muted-foreground">Kartu: {rsvp.partner_first_name} {rsvp.partner_last_name}</p>}
                          <p className="mt-2 text-sm text-muted-foreground">Meniu: {rsvp.meal_choice || "—"}{rsvp.partner_meal_choice ? ` / ${rsvp.partner_meal_choice}` : ""}</p>
                          {rsvp.dietary_notes && <p className="text-sm text-muted-foreground">Mityba: {rsvp.dietary_notes}</p>}
                          {rsvp.message && <p className="mt-2 italic text-moss-deep">“{rsvp.message}”</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};