import { useEffect, useState } from "react";
import { ChevronDown, ClipboardList, MessageCircle, Trash2 } from "lucide-react";
import { PageHeader, StatusPill } from "./adminUi";
import { Button, Chip, ConfirmDialog, EmptyState, Select, Spinner, useToast } from "../components/ui";
import { deleteOrder, fetchOrders, updateOrderStatus } from "../lib/api";
import { cleanPhone, cn, formatPrice, timeAgo, waLink } from "../lib/utils";

const STATUSES = ["new", "confirmed", "delivered", "cancelled"];
const tone = { new: "warn", confirmed: "good", delivered: "good", cancelled: "bad" };

// 0315... ko 92315... banata hai taake wa.me link chale
const toIntl = (p) => {
  const d = cleanPhone(p);
  if (d.startsWith("92")) return d;
  if (d.startsWith("0")) return "92" + d.slice(1);
  return d.length === 10 ? "92" + d : d;
};

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(null);
  const [del, setDel] = useState(null);

  useEffect(() => {
    fetchOrders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  const change = async (o, status) => {
    try {
      const next = await updateOrderStatus(o.id, status);
      setOrders((l) => l.map((x) => (x.id === o.id ? next : x)));
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const remove = async () => {
    try {
      await deleteOrder(del.id);
      setOrders((l) => l.filter((x) => x.id !== del.id));
      toast("Order deleted");
    } catch (e) {
      toast(e.message, "error");
    }
    setDel(null);
  };

  if (error) return <EmptyState icon={ClipboardList} title="Could not load orders" text={error} />;
  if (!orders) return <div className="grid min-h-[30svh] place-items-center"><Spinner /></div>;

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <PageHeader title="Orders" sub="Every time a customer presses Order now, a copy is saved here. The real chat happens on WhatsApp." />
      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} count={orders.length}>All</Chip>
        {STATUSES.map((s) => <Chip key={s} active={filter === s} onClick={() => setFilter(s)} count={orders.filter((o) => o.status === s).length}>{s[0].toUpperCase() + s.slice(1)}</Chip>)}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders here" text="New orders will appear as soon as customers send them." />
      ) : (
        <ul className="grid gap-3">
          {shown.map((o) => {
            const isOpen = open === o.id;
            const d = o.details || {};
            return (
              <li key={o.id} className="rounded-3xl border border-line bg-ivory shadow-soft">
                <button onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full items-center gap-4 p-4 text-left" aria-expanded={isOpen}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-medium text-olive-deep">{o.product_title}{o.quantity > 1 ? ` x${o.quantity}` : ""}</p>
                    <p className="text-sm text-mute">{o.customer_name}, {o.city} · {timeAgo(o.created_at)}</p>
                  </div>
                  {o.total != null && <span className="hidden text-[15px] sm:block">{formatPrice(o.total)}</span>}
                  <StatusPill tone={tone[o.status]}>{o.status}</StatusPill>
                  <ChevronDown className={cn("size-5 text-mute transition", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="grid gap-4 border-t border-line p-4 text-[15px] md:grid-cols-2">
                    <dl className="grid gap-1.5">
                      <div><dt className="inline text-mute">Phone: </dt><dd className="inline">{o.phone}</dd></div>
                      <div><dt className="inline text-mute">Address: </dt><dd className="inline">{o.address}</dd></div>
                      {o.total != null && <div><dt className="inline text-mute">Total: </dt><dd className="inline">{formatPrice(o.total)}</dd></div>}
                      {d.color && <div><dt className="inline text-mute">Color: </dt><dd className="inline">{d.color}</dd></div>}
                      {d.date && <div><dt className="inline text-mute">Needed by: </dt><dd className="inline">{d.date}</dd></div>}
                      {d.occasion && <div><dt className="inline text-mute">Occasion: </dt><dd className="inline">{d.occasion}</dd></div>}
                      {d.need && <div><dt className="inline text-mute">Needs: </dt><dd className="inline">{d.need}</dd></div>}
                      {d.budget && <div><dt className="inline text-mute">Budget: </dt><dd className="inline">{d.budget}</dd></div>}
                      {o.note && <div><dt className="inline text-mute">Notes: </dt><dd className="inline">{o.note}</dd></div>}
                    </dl>
                    <div className="grid content-start gap-3">
                      <Select value={o.status} onChange={(e) => change(o, e.target.value)} aria-label="Order status">
                        {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </Select>
                      <Button as="a" variant="outline" icon={MessageCircle} href={waLink(toIntl(o.phone), `Hi ${o.customer_name}, this is Alley Artificals about your order for ${o.product_title}.`)} target="_blank" rel="noreferrer">Message customer</Button>
                      <Button variant="dangerSoft" icon={Trash2} onClick={() => setDel(o)}>Delete order</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} title="Delete this order?" message="It will be removed from this list. Your WhatsApp chat is not affected." />
    </>
  );
}
