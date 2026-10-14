import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Card, PageHeader } from "./adminUi";
import { Button, Field, Input, Spinner, Textarea, useToast } from "../components/ui";
import { fetchSettings, saveSettings } from "../lib/api";
import { DEFAULT_SETTINGS } from "../lib/defaults";

export default function Settings() {
  const toast = useToast();
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((db) => setF({ ...DEFAULT_SETTINGS, ...Object.fromEntries(Object.entries(db || {}).filter(([, v]) => v != null && String(v).trim() !== "")) }))
      .catch((e) => toast(e.message, "error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!f) return <div className="grid min-h-[30svh] place-items-center"><Spinner /></div>;
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    try {
      await saveSettings(f);
      toast("Website updated");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Website settings" sub="Edit the words and contact details shown across your website. Leave a box empty to use the default." actions={<Button size="lg" icon={Save} loading={busy} onClick={save}>Save changes</Button>} />
      <div className="grid gap-6">
        <Card title="Top banner and home page">
          <div className="grid gap-5">
            <Field label="Announcement bar" hint="The thin line above the menu. Clear it to hide the bar."><Input value={f.announcement} onChange={set("announcement")} /></Field>
            <Field label="Home page headline" hint="Press Enter to start a new line. The second line is shown in italics."><Textarea rows={2} value={f.hero_title} onChange={set("hero_title")} /></Field>
            <Field label="Home page sub-heading"><Textarea rows={3} value={f.hero_sub} onChange={set("hero_sub")} /></Field>
            <Field label="About text" hint="Each new line becomes a paragraph. The last line is highlighted."><Textarea rows={6} value={f.about} onChange={set("about")} /></Field>
          </div>
        </Card>
        <Card title="Contact details" hint="Shown in the footer. Orders are sent to the WhatsApp number.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="WhatsApp number for orders" hint="Country code, digits only. Example: 923151284416"><Input inputMode="numeric" value={f.whatsapp} onChange={set("whatsapp")} /></Field>
            <Field label="Phone shown in footer"><Input value={f.phone} onChange={set("phone")} /></Field>
            <Field label="Email"><Input type="email" value={f.email} onChange={set("email")} /></Field>
            <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
          </div>
        </Card>
        <Card title="Social links" hint="Paste full links. Icons only appear for the ones you fill in.">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Instagram"><Input value={f.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." /></Field>
            <Field label="Facebook"><Input value={f.facebook} onChange={set("facebook")} placeholder="https://facebook.com/..." /></Field>
            <Field label="TikTok"><Input value={f.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@..." /></Field>
          </div>
        </Card>
      </div>
    </>
  );
}
