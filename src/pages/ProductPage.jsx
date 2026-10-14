import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Flower2, Gift, MessageCircle, Share2, ShoppingBag, Sparkles, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { Button, PriceTag, Spinner, useToast } from "../components/ui";
import ProductCard from "../components/shop/ProductCard";
import Reveal from "../components/Reveal";
import { cn, waLink } from "../lib/utils";
import { usePageTitle } from "../lib/usePageTitle";
import NotFound from "./NotFound";

const RECENT_KEY = "alley_recent";

export default function ProductPage() {
  const { id } = useParams();
  const { products, catById, status, openOrder, settings } = useShop();
  const toast = useToast();
  const p = products.find((x) => x.id === id);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  usePageTitle(p?.title);

  useEffect(() => setIdx(0), [id]);

  // Recently viewed (sirf is browser mein)
  const [recentIds, setRecentIds] = useState([]);
  useEffect(() => {
    if (!p) return;
    try {
      const prev = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecentIds(prev.filter((x) => x !== p.id));
      localStorage.setItem(RECENT_KEY, JSON.stringify([p.id, ...prev.filter((x) => x !== p.id)].slice(0, 12)));
    } catch {
      setRecentIds([]);
    }
  }, [p?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(() => {
    if (!p) return [];
    const same = products.filter((x) => x.id !== p.id && x.category_id === p.category_id);
    same.sort((a, b) => Number(b.subcategory_id === p.subcategory_id) - Number(a.subcategory_id === p.subcategory_id));
    return same.slice(0, 4);
  }, [p, products]);
  const recent = useMemo(() => recentIds.map((r) => products.find((x) => x.id === r)).filter(Boolean).slice(0, 4), [recentIds, products]);

  if (status === "loading") return <div className="grid min-h-[50svh] place-items-center"><Spinner /></div>;
  if (!p) return <NotFound />;

  const imgs = p.images || [];
  const cur = imgs[idx];
  const cat = catById[p.category_id];
  const sub = catById[p.subcategory_id];
  const go = (d) => setIdx((i) => (i + d + imgs.length) % imgs.length);
  const pageUrl = window.location.href;

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: p.title, url: pageUrl });
      else {
        await navigator.clipboard.writeText(pageUrl);
        toast("Link copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="container-x pb-6 pt-6 md:pt-10">
      <nav className="mb-6 text-sm text-mute" aria-label="Breadcrumb">
        <Link to="/shop" className="hover:text-olive">Shop</Link>
        {cat && <> / <Link to={`/category/${cat.slug}`} className="hover:text-olive">{cat.name}</Link></>}
        {sub && cat && <> / <Link to={`/category/${cat.slug}?sub=${sub.slug}`} className="hover:text-olive">{sub.name}</Link></>}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-sand">
            {cur ? (
              <button onClick={() => setZoom(true)} className="block w-full cursor-zoom-in" aria-label="Zoom image">
                <AnimatePresence mode="wait">
                  <motion.img key={cur.url} src={cur.url} alt={p.title} className="mx-auto block max-h-[78svh] w-full object-contain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
                </AnimatePresence>
              </button>
            ) : (
              <div className="grid aspect-[4/5] place-items-center text-gold"><Flower2 className="size-14" /></div>
            )}
            {imgs.length > 1 && (
              <>
                <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-olive shadow-soft hover:bg-white"><ChevronLeft className="size-5" /></button>
                <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-olive shadow-soft hover:bg-white"><ChevronRight className="size-5" /></button>
              </>
            )}
          </div>
          {imgs.length > 1 && (
            <div className="hide-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
              {imgs.map((im, i) => (
                <button key={im.url} onClick={() => setIdx(i)} aria-label={`Show image ${i + 1}`} className={cn("size-20 shrink-0 overflow-hidden rounded-xl border-2 transition", i === idx ? "border-olive" : "border-transparent opacity-70 hover:opacity-100")}>
                  <img src={im.url} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {cat && <Link to={`/category/${cat.slug}`} className="rounded-full bg-sand px-3.5 py-1 text-sm text-olive">{cat.name}</Link>}
            {sub && cat && <Link to={`/category/${cat.slug}?sub=${sub.slug}`} className="rounded-full bg-sand px-3.5 py-1 text-sm text-olive">{sub.name}</Link>}
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl">{p.title}</h1>
          <PriceTag product={p} size="lg" className="mt-5" />
          <p className={cn("mt-3 text-sm", p.in_stock ? "text-olive-soft" : "text-rose")}>{p.in_stock ? "Available to order" : "Sold out right now. Message us and we can make it for you."}</p>

          {p.colors?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-olive-deep">Colors</p>
              <div className="flex flex-wrap gap-2">{p.colors.map((c) => <span key={c} className="rounded-full border border-line bg-ivory px-3.5 py-1.5 text-sm">{c}</span>)}</div>
            </div>
          )}

          {p.description && <p className="mt-7 whitespace-pre-line text-base leading-relaxed text-ink/80">{p.description}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" icon={ShoppingBag} onClick={() => openOrder(p)} disabled={!p.in_stock} className="flex-1 sm:flex-none">
              Order now
            </Button>
            <Button as="a" variant="outline" size="lg" icon={MessageCircle} href={waLink(settings.whatsapp, `Hi Alley Artificals, I am interested in "${p.title}". ${pageUrl}`)} target="_blank" rel="noreferrer">
              Ask on WhatsApp
            </Button>
            <Button variant="ghost" size="lg" icon={Share2} onClick={share} aria-label="Share">Share</Button>
          </div>

          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-[15px] text-ink/80">
            <li className="flex items-center gap-3"><Sparkles className="size-5 text-gold" /> Beautiful, elegant and made to last</li>
            <li className="flex items-center gap-3"><Gift className="size-5 text-gold" /> Custom colors and sizes on request</li>
            <li className="flex items-center gap-3"><MessageCircle className="size-5 text-gold" /> Confirmed on WhatsApp, no online payment</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-20">
          <Reveal><h2 className="mb-8 text-4xl md:text-5xl">You may also love</h2></Reveal>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
      {recent.length > 0 && (
        <section className="pt-16">
          <h2 className="mb-6 text-3xl md:text-4xl">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{recent.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}

      <AnimatePresence>
        {zoom && cur && (
          <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-olive-deep/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)}>
            <button aria-label="Close" className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-cream/15 text-cream hover:bg-cream/25"><X className="size-6" /></button>
            <img src={cur.url} alt={p.title} className="max-h-[92svh] max-w-full rounded-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
