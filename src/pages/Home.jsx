import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Cake, Crown, Flower2, Gem, Gift, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useShop } from "../context/ShopContext";
import Reveal from "../components/Reveal";
import ProductCard, { GridSkeleton, ProductGrid } from "../components/shop/ProductCard";
import { Button } from "../components/ui";
import { isOnSale, salePercent } from "../lib/utils";
import { usePageTitle } from "../lib/usePageTitle";

function Hero() {
  const { ready, settings, openOrder } = useShop();
  const mx = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const lx = useTransform(sx, [-1, 1], [14, -14]);
  const rx = useTransform(sx, [-1, 1], [-14, 14]);
  const lines = String(settings.hero_title).split("\n");

  // Hero ka sequence `ready` (splash khatam) par shuru hota hai
  const rise = (i) => ({
    initial: { opacity: 0, y: 30 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    transition: { delay: 0.15 + i * 0.14, duration: 1, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section
      className="light-beam relative isolate overflow-hidden"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      }}
    >
      <motion.img
        src="/hero-left.webp"
        alt=""
        aria-hidden
        style={{ x: lx }}
        className="hero-crop-l pointer-events-none absolute left-0 top-0 -z-10 h-[17rem] w-auto max-w-none -translate-x-[14%] select-none sm:h-[20rem] md:bottom-0 md:top-auto md:h-full md:translate-x-0"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      <motion.img
        src="/hero-right.webp"
        alt=""
        aria-hidden
        style={{ x: rx }}
        className="hero-crop-r pointer-events-none absolute right-0 top-0 -z-10 h-[17rem] w-auto max-w-none translate-x-[14%] select-none sm:h-[20rem] md:bottom-0 md:top-auto md:h-full md:translate-x-0"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
        transition={{ duration: 1.6, delay: 0.2, ease: "easeOut" }}
      />

      <div className="container-x grid place-items-center pb-14 pt-[17rem] text-center sm:pt-[20rem] md:h-[calc(100svh-9rem)] md:max-h-[780px] md:pb-10 md:pt-10">
        <div className="relative max-w-4xl">
          <span aria-hidden className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 bg-[radial-gradient(closest-side,rgb(252_250_245/0.88),rgb(252_250_245/0.55)_55%,transparent)]" />
          <h1 className="text-[clamp(2.7rem,6.4vw,5.4rem)] leading-[1]">
            {lines.map((l, i) => (
              <motion.span key={i} {...rise(i)} className={i > 0 ? "block italic text-olive-soft" : "block"}>
                {l}
              </motion.span>
            ))}
          </h1>
          <motion.p {...rise(lines.length)} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/75 md:text-lg">
            {settings.hero_sub}
          </motion.p>
          <motion.div {...rise(lines.length + 1)} className="mt-9 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/shop" size="lg">
              Shop the collection
            </Button>
            <Button variant="outline" size="lg" className="bg-ivory/70 backdrop-blur" onClick={() => openOrder(null)}>
              Order something custom
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const TILE_ICON = { "artificial-jewellery": Gem, "cakes-and-boxes": Gift, bouquets: Flower2, "customized-bouquets": Sparkles };

function CategoryTiles() {
  const { tops, products, status } = useShop();
  const tiles = tops.map((c) => {
    const items = products.filter((p) => p.category_id === c.id);
    return { c, count: items.length, img: items.find((p) => p.images?.[0])?.images[0] };
  });
  if (status === "ready" && tops.length === 0) return null;
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-4xl md:text-6xl">Find your piece</h2>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-olive transition-all hover:gap-3">
          Browse everything <ArrowRight className="size-4" />
        </Link>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {tiles.map(({ c, count, img }, i) => {
          const Icon = TILE_ICON[c.slug] || Flower2;
          return (
            <Reveal key={c.id} delay={i * 0.08}>
              <Link to={`/category/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blush to-sand shadow-soft">
                {img ? (
                  <img src={img.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                ) : (
                  <Icon className="absolute left-1/2 top-[40%] size-14 -translate-x-1/2 text-gold/70" />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-olive-deep/80 via-olive-deep/10 to-transparent" />
                <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 text-cream md:inset-x-6 md:bottom-6">
                  <span>
                    <span className="block font-display text-2xl leading-tight md:text-3xl">{c.name}</span>
                    <span className="text-[13px] text-cream/75">{count} {count === 1 ? "piece" : "pieces"}</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cream/90 text-olive transition group-hover:bg-gold group-hover:text-olive-deep">
                    <ArrowRight className="size-4" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function FreshPicks() {
  const { shuffled, status } = useShop();
  const items = shuffled.slice(0, 8);
  if (status === "ready" && items.length === 0) return null;
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-6xl">Picked for you today</h2>
          <p className="mt-3 max-w-md text-[15px] text-mute">A fresh mix of florals, gifts and jewelry. It changes every visit.</p>
        </div>
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-olive transition-all hover:gap-3">
          View all <ArrowRight className="size-4" />
        </Link>
      </Reveal>
      {status === "loading" ? <GridSkeleton n={8} /> : <ProductGrid items={items} />}
    </section>
  );
}

function SaleBand() {
  const { products } = useShop();
  const sale = useMemo(() => products.filter(isOnSale), [products]);
  if (!sale.length) return null;
  const best = Math.max(...sale.map(salePercent));
  return (
    <section className="mt-20 bg-olive-deep py-16 text-cream md:mt-28 md:py-20">
      <div className="container-x">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl text-cream md:text-6xl">On sale now</h2>
            <p className="mt-3 text-[15px] text-cream/70">Save up to {best}% on selected pieces while they last.</p>
          </div>
          <Button as={Link} to="/sale" variant="gold">See all sale pieces</Button>
        </Reveal>
        <div className="hide-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
          {sale.slice(0, 10).map((p) => (
            <div key={p.id} className="w-56 shrink-0 md:w-64">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const OCC = [
  { label: "Mehndi", Icon: Flower2 },
  { label: "Mayun", Icon: Sparkles },
  { label: "Wedding / Barat", Icon: Crown },
  { label: "Birthday", Icon: Cake },
  { label: "Anniversary", Icon: Heart },
  { label: "Gift", Icon: Gift },
];

function Occasions() {
  const { openOrder } = useShop();
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-4xl md:text-6xl">Planning an occasion?</h2>
        <p className="mt-4 text-[15px] text-mute">Pick yours and tell us what you imagine. We will design it and confirm the price on WhatsApp.</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {OCC.map(({ label, Icon }, i) => (
          <Reveal key={label} delay={i * 0.05} className="h-full">
            <button
              onClick={() => openOrder(null, { occasion: label })}
              className="group flex h-full w-full flex-col items-start gap-3 rounded-3xl border border-line bg-ivory p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-olive hover:bg-olive hover:text-cream hover:shadow-lift md:flex-row md:items-center md:gap-4 md:p-6"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sand text-olive transition group-hover:bg-cream/15 group-hover:text-gold-soft md:size-12">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 font-display text-[1.4rem] leading-tight md:text-2xl">{label}</span>
              <ArrowRight className="ml-auto hidden size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:block" />
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  const { settings } = useShop();
  const paras = String(settings.about).split("\n").filter(Boolean);
  return (
    <section id="about" className="container-x grid items-center gap-12 pt-20 md:grid-cols-2 md:gap-20 md:pt-28">
      <Reveal>
        <div className="relative mx-auto max-w-md">
          <span className="absolute -bottom-4 -right-4 size-full rounded-[2rem] border border-gold/60" />
          <img src="/brand-square.webp" alt="Alley Artificals logo on soft cream paper with white blooms" loading="lazy" className="relative aspect-square w-full rounded-[2rem] object-cover shadow-lift" />
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="text-4xl md:text-6xl">About Alley Artificals</h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-ink/80 md:text-[17px]">
          {paras.map((t, i) => (
            <p key={i} className={i === paras.length - 1 ? "font-display text-2xl italic text-olive" : ""}>{t}</p>
          ))}
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { Icon: Flower2, t: "Premium florals" },
            { Icon: Gem, t: "Handmade floral jewelry" },
            { Icon: Gift, t: "Custom gift hampers" },
          ].map(({ Icon, t }) => (
            <li key={t} className="flex items-center gap-3 text-[15px] text-olive-deep">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand text-gold"><Icon className="size-[18px]" /></span>
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { t: "Choose your piece", d: "Browse, filter and tap Order now on anything you love." },
    { t: "Fill the short form", d: "Your name, address and any notes. It takes a minute." },
    { t: "Confirm on WhatsApp", d: "Your order lands in our chat. We confirm price and delivery with you. No online payment." },
  ];
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal className="mb-10">
        <h2 className="text-4xl md:text-6xl">How ordering works</h2>
      </Reveal>
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.t} delay={i * 0.1}>
            <li className="h-full rounded-3xl border border-line bg-ivory p-7">
              <span className="font-display text-5xl text-gold">{i + 1}</span>
              <h3 className="mt-3 text-2xl">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">{s.d}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function CustomCta() {
  const { openOrder } = useShop();
  return (
    <section className="container-x pt-20 md:pt-28">
      <Reveal className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-4xl md:text-6xl">Something made just for you</h2>
        <p className="mt-4 text-[15px] text-mute">Bridal sets, bouquets in your colors, hampers for someone special. Share your idea and we will make it.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button size="lg" onClick={() => openOrder(null)}>Start a custom order</Button>
        </div>
      </Reveal>
      <Reveal>
        <img src="/banner.webp" alt="Alley Artificals bouquets, gift boxes and floral jewelry" loading="lazy" className="w-full rounded-[2rem] shadow-lift" />
      </Reveal>
    </section>
  );
}

export default function Home() {
  usePageTitle("");
  return (
    <>
      <Hero />
      <CategoryTiles />
      <FreshPicks />
      <SaleBand />
      <Occasions />
      <About />
      <HowItWorks />
      <CustomCta />
    </>
  );
}