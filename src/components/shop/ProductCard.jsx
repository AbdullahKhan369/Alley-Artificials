import { Link } from "react-router-dom";
import { Flower2, ShoppingBag } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { PriceTag } from "../ui";
import { clamp } from "../../lib/utils";

// Natural aspect ratio (image ki apni shakal), sirf bohat extreme ratio clamp hota hai. Zabardasti fixed box nahi.
export default function ProductCard({ p }) {
  const { openOrder, catById } = useShop();
  const img = p.images?.[0];
  const ratio = img?.w && img?.h ? clamp(img.w / img.h, 0.6, 1.5) : 0.8;
  const label = (catById[p.subcategory_id] || catById[p.category_id])?.name;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-ivory shadow-soft transition-shadow duration-500 hover:shadow-lift">
      <Link to={`/product/${p.id}`} className="block">
        <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: ratio }}>
          {img ? (
            <img
              src={img.url}
              alt={p.title}
              loading="lazy"
              decoding="async"
              width={img.w || undefined}
              height={img.h || undefined}
              className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-gold">
              <Flower2 className="size-10" />
            </span>
          )}
          {!p.in_stock && <span className="absolute left-3 top-3 rounded-full bg-olive-deep/85 px-3 py-1 text-xs text-cream">Sold out</span>}
        </div>
        <div className="px-4 pb-4 pt-3.5">
          {label && <p className="mb-1 text-xs text-mute">{label}</p>}
          <h3 className="line-clamp-2 text-[1.35rem] leading-[1.15]">{p.title}</h3>
          <PriceTag product={p} size="sm" className="mt-2" />
        </div>
      </Link>
      {p.in_stock && (
        <button
          onClick={() => openOrder(p)}
          aria-label={`Order ${p.title}`}
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-cream/90 text-olive opacity-100 shadow-soft backdrop-blur transition hover:bg-olive hover:text-cream md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <ShoppingBag className="size-[18px]" />
        </button>
      )}
    </article>
  );
}

export function ProductGrid({ items }) {
  return (
    <div className="masonry">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

export function GridSkeleton({ n = 8 }) {
  const heights = [280, 360, 320, 400, 300, 340, 380, 290];
  return (
    <div className="masonry" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-ivory">
          <div className="skeleton" style={{ height: heights[i % heights.length] }} />
          <div className="space-y-2 p-4">
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
