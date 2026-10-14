import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flower2, MessageCircle, Menu, Search, X } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { Button, PriceTag } from "../ui";
import { cn, isOnSale, waLink } from "../../lib/utils";

function Logo({ small }) {
  return (
    <Link to="/" aria-label="Alley Artificals home" className="group flex items-center gap-2.5">
      <img src="/logo-mark.png" alt="" className={cn("w-auto transition-all duration-500", small ? "h-8" : "h-10 md:h-12")} />
      <img src="/logo-name.png" alt="Alley Artificals" className={cn("hidden w-auto transition-all duration-500 sm:block", small ? "h-3.5" : "h-4 md:h-[18px]")} />
    </Link>
  );
}

export default function Navbar() {
  const { tops, subsOf, products, settings, openOrder } = useShop();
  const loc = useLocation();
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 12);
  const [menu, setMenu] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMenu(null);
    setDrawer(false);
    setSearch(false);
  }, [loc.pathname, loc.search]);

  const hasSale = useMemo(() => products.some(isOnSale), [products]);
  const links = [
    { to: "/shop", label: "All", end: true },
    ...tops.map((c) => ({ to: `/category/${c.slug}`, label: c.name, cat: c })),
    ...(hasSale ? [{ to: "/sale", label: "Sale", sale: true }] : []),
  ];
  const openCat = tops.find((c) => c.slug === menu);
  const openSubs = openCat ? subsOf(openCat.id) : [];
  const preview = openCat ? products.find((p) => p.category_id === openCat.id && p.images?.[0]) : null;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled ? "border-b border-line bg-cream/85 shadow-[0_8px_30px_-18px_rgb(59_70_48/0.35)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        )}
        onMouseLeave={() => setMenu(null)}
      >
        <div className={cn("container-x grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500", scrolled ? "py-2" : "py-3 md:py-4")}>
          <div className="flex items-center gap-1">
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className="grid size-11 place-items-center rounded-full text-olive transition hover:bg-olive/10 lg:hidden">
              <Menu className="size-6" />
            </button>
            <button onClick={() => setSearch(true)} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-olive transition hover:bg-olive/10 lg:flex">
              <Search className="size-[18px]" /> Search
            </button>
          </div>
          <Logo small={scrolled} />
          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => setSearch(true)} aria-label="Search" className="grid size-11 place-items-center rounded-full text-olive transition hover:bg-olive/10 lg:hidden">
              <Search className="size-[22px]" />
            </button>
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hidden size-11 place-items-center rounded-full text-olive transition hover:bg-olive/10 md:grid">
              <MessageCircle className="size-[22px]" />
            </a>
            <Button size="sm" onClick={() => openOrder(null)} className="max-sm:hidden">
              Custom order
            </Button>
          </div>
        </div>

        <nav className="hidden border-t border-line/60 lg:block" aria-label="Main">
          <ul className="container-x flex items-center justify-center gap-9">
            {links.map((l) => (
              <li key={l.to} onMouseEnter={() => setMenu(l.cat && subsOf(l.cat.id).length ? l.cat.slug : null)}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      "relative block py-3 text-[15px] tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
                      l.sale ? "font-medium text-rose" : "text-olive",
                      isActive && "after:scale-x-100"
                    )
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <AnimatePresence>
          {openCat && openSubs.length > 0 && (
            <motion.div
              key={openCat.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-x-0 top-full hidden border-b border-line bg-ivory shadow-lift lg:block"
              onMouseEnter={() => setMenu(openCat.slug)}
            >
              <div className="container-x grid grid-cols-[1fr_auto] items-center gap-10 py-8">
                <div>
                  <p className="mb-4 font-display text-3xl text-olive-deep">{openCat.name}</p>
                  <ul className="grid max-w-2xl grid-cols-2 gap-x-10 gap-y-2.5">
                    {openSubs.map((s) => (
                      <li key={s.id}>
                        <Link to={`/category/${openCat.slug}?sub=${s.slug}`} className="group inline-flex items-center gap-2 text-[15px] text-ink/85 transition hover:text-olive">
                          <Flower2 className="size-3.5 text-gold" />
                          <span className="border-b border-transparent transition group-hover:border-gold">{s.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/category/${openCat.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-olive hover:gap-3 transition-all">
                    View everything in {openCat.name} <ArrowRight className="size-4" />
                  </Link>
                </div>
                {preview && (
                  <Link to={`/product/${preview.id}`} className="block w-40 overflow-hidden rounded-2xl shadow-soft">
                    <img src={preview.images[0].url} alt={preview.title} className="aspect-[4/5] w-full object-cover" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} links={links} subsOf={subsOf} settings={settings} openOrder={openOrder} />
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}

function MobileDrawer({ open, onClose, links, subsOf, settings, openOrder }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div className="absolute inset-0 bg-olive-deep/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-cream shadow-lift"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <img src="/logo-name.png" alt="Alley Artificals" className="h-4 w-auto" />
              <button onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full text-olive hover:bg-olive/10">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 pb-6">
              {links.map((l) => {
                const subs = l.cat ? subsOf(l.cat.id) : [];
                return (
                  <div key={l.to} className="border-b border-line py-4">
                    <Link to={l.to} className={cn("font-display text-3xl", l.sale ? "text-rose" : "text-olive-deep")}>
                      {l.label}
                    </Link>
                    {subs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {subs.map((s) => (
                          <Link key={s.id} to={`/category/${l.cat.slug}?sub=${s.slug}`} className="rounded-full border border-line bg-ivory px-3.5 py-1.5 text-sm text-olive">
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="grid gap-3 border-t border-line p-5">
              <Button onClick={() => { onClose(); openOrder(null); }}>Custom order</Button>
              <Button as="a" variant="outline" href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" icon={MessageCircle}>
                Chat on WhatsApp
              </Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose }) {
  const { products } = useShop();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    return products.filter((p) => `${p.title} ${p.description || ""}`.toLowerCase().includes(s)).slice(0, 7);
  }, [q, products]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95]">
          <motion.div className="absolute inset-0 bg-olive-deep/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative mx-auto mt-0 w-full max-w-2xl rounded-b-3xl bg-cream p-5 shadow-lift sm:mt-6 sm:rounded-3xl"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            <form onSubmit={submit} className="flex items-center gap-3 rounded-2xl border border-line bg-ivory px-4">
              <Search className="size-5 text-mute" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search bouquets, jewelry, hampers..."
                className="w-full bg-transparent py-4 text-base text-ink outline-none placeholder:text-mute/70"
              />
              <button type="button" onClick={onClose} aria-label="Close search" className="text-mute hover:text-olive">
                <X className="size-5" />
              </button>
            </form>
            <div className="mt-3 max-h-[60svh] overflow-y-auto">
              {q.trim().length >= 2 && results.length === 0 && <p className="px-2 py-6 text-center text-[15px] text-mute">Nothing found for "{q}". Try another word or send us a custom order.</p>}
              {results.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-4 rounded-2xl p-2.5 transition hover:bg-sand/70">
                  <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-sand">{p.images?.[0] && <img src={p.images[0].url} alt="" className="size-full object-cover" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-xl text-olive-deep">{p.title}</span>
                    <PriceTag product={p} size="sm" />
                  </span>
                </Link>
              ))}
              {q.trim() && results.length > 0 && (
                <button onClick={submit} className="mt-1 w-full rounded-xl py-3 text-sm font-medium text-olive hover:bg-sand/70">
                  See all results for "{q}"
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
