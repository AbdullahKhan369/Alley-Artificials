import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgePercent, ClipboardList, Package, Plus, Settings as Cog, Tags } from "lucide-react";
import { useAdminData } from "./adminData";
import { Card, PageHeader, StatusPill } from "./adminUi";
import { Button } from "../components/ui";
import { fetchOrders } from "../lib/api";
import { formatPrice, isOnSale, timeAgo } from "../lib/utils";

export default function Dashboard() {
  const { products, categories, tops } = useAdminData();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const stats = [
    { label: "Products", value: products.length, to: "/admin/products", icon: Package },
    { label: "On sale", value: products.filter(isOnSale).length, to: "/admin/sale", icon: BadgePercent },
    { label: "Sub-categories", value: categories.length - tops.length, to: "/admin/categories", icon: Tags },
    { label: "New orders", value: orders ? orders.filter((o) => o.status === "new").length : "-", to: "/admin/orders", icon: ClipboardList },
  ];
  const hidden = products.filter((p) => !p.is_active).length;
  const sold = products.filter((p) => !p.in_stock).length;

  return (
    <>
      <PageHeader title="Welcome back" sub="Everything for your website is managed from here. Pick a big button below to start." />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, to, icon: Icon }) => (
          <Link key={label} to={to} className="group rounded-3xl border border-line bg-ivory p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
            <Icon className="size-6 text-gold" />
            <p className="mt-3 font-display text-5xl text-olive-deep">{value}</p>
            <p className="text-[15px] text-mute">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Button as={Link} to="/admin/products/new" size="lg" icon={Plus}>Add new product</Button>
        <Button as={Link} to="/admin/sale" size="lg" variant="outline" icon={BadgePercent}>Manage sale</Button>
        <Button as={Link} to="/admin/categories" size="lg" variant="outline" icon={Tags}>Edit categories</Button>
        <Button as={Link} to="/admin/settings" size="lg" variant="outline" icon={Cog}>Website settings</Button>
      </div>

      {(hidden > 0 || sold > 0) && (
        <p className="mb-8 rounded-2xl bg-gold/15 px-5 py-4 text-[15px] text-olive-deep">
          {hidden > 0 && <>{hidden} product{hidden > 1 ? "s are" : " is"} hidden from the website. </>}
          {sold > 0 && <>{sold} product{sold > 1 ? "s are" : " is"} marked sold out.</>}
        </p>
      )}

      <Card title="Latest orders" hint="Orders also arrive on WhatsApp. This list is your record.">
        {orders === null && <p className="text-mute">Loading...</p>}
        {orders && orders.length === 0 && <p className="text-[15px] text-mute">No orders yet. They will show up here when customers press Order now.</p>}
        <ul className="divide-y divide-line">
          {(orders || []).slice(0, 6).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-olive-deep">{o.product_title}</p>
                <p className="text-sm text-mute">{o.customer_name}, {o.city} · {timeAgo(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                {o.total != null && <span className="text-[15px]">{formatPrice(o.total)}</span>}
                <StatusPill tone={o.status === "new" ? "warn" : o.status === "cancelled" ? "bad" : "good"}>{o.status}</StatusPill>
              </div>
            </li>
          ))}
        </ul>
        {orders && orders.length > 0 && <Link to="/admin/orders" className="mt-4 inline-block text-[15px] font-medium text-olive hover:underline">See all orders</Link>}
      </Card>
    </>
  );
}
