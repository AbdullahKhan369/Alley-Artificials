import { useMemo, useState } from "react";
import { Check, Minus, Plus, Send } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { Button, Field, Input, Modal, PriceTag, Select, Textarea } from "../ui";
import { createOrder } from "../../lib/api";
import { OCCASIONS } from "../../lib/defaults";
import { cleanPhone, finalPrice, formatPrice, isOnSale, waLink } from "../../lib/utils";

const SAVED_KEY = "alley_customer";
const NEEDS = ["Floral jewelry set", "Bouquet", "Gift hamper / box", "Cake and box", "Something else"];

export default function OrderModal() {
  const { order, closeOrder } = useShop();
  const { open, product, nonce } = order;
  return (
    <Modal open={open} onClose={closeOrder} title={product ? "Order this piece" : "Custom order"} wide>
      {/* key = naya form har dafa open hone par (purani values nahi bachti) */}
      <OrderForm key={nonce} product={product} preset={order.preset} onClose={closeOrder} />
    </Modal>
  );
}

function OrderForm({ product, preset, onClose }) {
  const { settings } = useShop();
  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || "{}");
    } catch {
      return {};
    }
  }, []);

  const [f, setF] = useState({
    name: saved.name || "",
    phone: saved.phone || "",
    city: saved.city || "Karachi",
    address: saved.address || "",
    qty: 1,
    color: "",
    date: "",
    note: "",
    occasion: preset?.occasion || "",
    need: "",
    budget: "",
  });
  const [errors, setErrors] = useState({});
  const [sentUrl, setSentUrl] = useState("");
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const unit = product ? finalPrice(product) : 0;
  const total = unit * f.qty;
  const hasColors = product?.colors?.length > 0;

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Please enter your name";
    const ph = cleanPhone(f.phone);
    if (ph.length < 10 || ph.length > 13) e.phone = "Enter a valid phone number, e.g. 0315 1234567";
    if (!f.city.trim()) e.city = "Enter your city";
    if (f.address.trim().length < 8) e.address = "Enter your full delivery address";
    if (hasColors && !f.color) e.color = "Please choose a color";
    if (!product) {
      if (!f.occasion) e.occasion = "Choose an occasion";
      if (!f.need) e.need = "Tell us what you need";
      if (f.note.trim().length < 5) e.note = "Describe what you would like, even briefly";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = () => {
    const L = ["*New order request | Alley Artificals*", ""];
    if (product) {
      L.push(`*Product:* ${product.title}`);
      L.push(`*Link:* ${window.location.origin}/product/${product.id}`);
      if (f.color) L.push(`*Color:* ${f.color}`);
      L.push(`*Quantity:* ${f.qty}`);
      L.push(`*Price:* ${formatPrice(unit)} each${isOnSale(product) ? ` (sale, was ${formatPrice(product.price)})` : ""}`);
      L.push(`*Total:* ${formatPrice(total)}`);
    } else {
      L.push("*Custom order*");
      L.push(`*Occasion:* ${f.occasion}`);
      L.push(`*Needed:* ${f.need}`);
      if (f.budget.trim()) L.push(`*Budget:* ${f.budget.trim()}`);
    }
    L.push("", "*Customer details*");
    L.push(`*Name:* ${f.name.trim()}`);
    L.push(`*Phone:* ${f.phone.trim()}`);
    L.push(`*City:* ${f.city.trim()}`);
    L.push(`*Address:* ${f.address.trim()}`);
    if (f.date) L.push(`*Needed by:* ${f.date}`);
    if (f.note.trim()) L.push(`*Notes:* ${f.note.trim()}`);
    return L.join("\n");
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const url = waLink(settings.whatsapp, buildMessage());
    // window.open sync hona chahiye (click ke andar), warna mobile browser popup block kar deta hai
    const w = window.open(url, "_blank");
    if (!w) window.location.href = url;
    setSentUrl(url);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify({ name: f.name, phone: f.phone, city: f.city, address: f.address }));
    } catch {
      /* ignore */
    }
    // Admin ke record ke liye (WhatsApp is par depend nahi karta, fail ho to bhi theek)
    createOrder({
      product_id: product?.id || null,
      product_title: product?.title || "Custom order",
      quantity: product ? f.qty : 1,
      unit_price: product ? unit : null,
      total: product ? total : null,
      customer_name: f.name.trim(),
      phone: f.phone.trim(),
      city: f.city.trim(),
      address: f.address.trim(),
      note: f.note.trim() || null,
      details: { color: f.color || null, date: f.date || null, occasion: f.occasion || null, need: f.need || null, budget: f.budget || null },
    }).catch(() => {});
  };

  if (sentUrl) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-olive text-cream">
          <Check className="size-8" />
        </span>
        <h3 className="text-3xl">One last step</h3>
        <p className="max-w-sm text-[15px] text-ink/75">WhatsApp has opened with your order filled in. Press send there and we will confirm the price and delivery with you.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button as="a" href={sentUrl} target="_blank" rel="noreferrer" icon={Send}>
            Open WhatsApp again
          </Button>
          <Button variant="soft" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      {product && (
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-ivory p-3">
          <span className="size-20 shrink-0 overflow-hidden rounded-xl bg-sand">{product.images?.[0] && <img src={product.images[0].url} alt="" className="size-full object-cover" />}</span>
          <div className="min-w-0">
            <p className="line-clamp-2 font-display text-xl leading-tight text-olive-deep">{product.title}</p>
            <PriceTag product={product} size="sm" className="mt-1" />
          </div>
        </div>
      )}

      {!product && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Occasion" required error={errors.occasion}>
              <Select value={f.occasion} onChange={set("occasion")}>
                <option value="">Choose an occasion</option>
                {OCCASIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="What do you need?" required error={errors.need}>
              <Select value={f.need} onChange={set("need")}>
                <option value="">Choose one</option>
                {NEEDS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Tell us your idea" required error={errors.note} hint="Colors, theme, size, anything you have in mind.">
            <Textarea rows={3} value={f.note} onChange={set("note")} placeholder="e.g. Ivory and blush bridal bouquet with matching hair accessories" />
          </Field>
        </>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          <Input value={f.name} onChange={set("name")} autoComplete="name" placeholder="Full name" />
        </Field>
        <Field label="Phone / WhatsApp" required error={errors.phone}>
          <Input value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="03XX XXXXXXX" />
        </Field>
        <Field label="City" required error={errors.city}>
          <Input value={f.city} onChange={set("city")} autoComplete="address-level2" />
        </Field>
        <Field label="Needed by (optional)">
          <Input type="date" value={f.date} onChange={set("date")} min={new Date().toISOString().slice(0, 10)} />
        </Field>
      </div>
      <Field label="Delivery address" required error={errors.address}>
        <Textarea rows={2} value={f.address} onChange={set("address")} autoComplete="street-address" placeholder="House / street, area, landmark" />
      </Field>

      {product && (
        <div className="grid gap-5 sm:grid-cols-2">
          {hasColors && (
            <Field label="Color" required error={errors.color}>
              <Select value={f.color} onChange={set("color")}>
                <option value="">Choose a color</option>
                {product.colors.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          )}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-olive-deep">Quantity</span>
            <div className="inline-flex items-center rounded-full border border-line bg-ivory">
              <button type="button" aria-label="Decrease" onClick={() => setF((x) => ({ ...x, qty: Math.max(1, x.qty - 1) }))} className="grid size-12 place-items-center text-olive hover:text-gold">
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-[15px] font-medium" aria-live="polite">{f.qty}</span>
              <button type="button" aria-label="Increase" onClick={() => setF((x) => ({ ...x, qty: Math.min(50, x.qty + 1) }))} className="grid size-12 place-items-center text-olive hover:text-gold">
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <Field label="Notes (optional)" className="sm:col-span-2">
            <Input value={f.note} onChange={set("note")} placeholder="Card message, packing request, anything else" />
          </Field>
        </div>
      )}

      {!product && (
        <Field label="Budget (optional)">
          <Input value={f.budget} onChange={set("budget")} placeholder="e.g. Rs. 5,000 to 8,000" />
        </Field>
      )}

      <div className="sticky bottom-0 -mx-6 -mb-5 flex flex-wrap items-center justify-between gap-4 border-t border-line bg-cream/95 px-6 py-4 backdrop-blur">
        <div>
          {product ? (
            <>
              <p className="text-xs text-mute">Total</p>
              <p className="font-display text-3xl text-olive-deep">{formatPrice(total)}</p>
            </>
          ) : (
            <p className="max-w-[16rem] text-[13px] text-mute">We will reply on WhatsApp with a price and a delivery date.</p>
          )}
        </div>
        <Button type="submit" size="lg" icon={Send}>
          Order now on WhatsApp
        </Button>
      </div>
    </form>
  );
}
