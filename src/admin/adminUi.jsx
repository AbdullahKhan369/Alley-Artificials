import { cn } from "../lib/utils";

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-base text-mute">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ title, hint, children, className }) {
  return (
    <section className={cn("rounded-3xl border border-line bg-ivory p-5 shadow-soft md:p-7", className)}>
      {title && (
        <div className="mb-5">
          <h2 className="text-2xl md:text-3xl">{title}</h2>
          {hint && <p className="mt-1 text-[15px] text-mute">{hint}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Thumb({ product, className }) {
  const im = product?.images?.[0];
  return (
    <span className={cn("block shrink-0 overflow-hidden rounded-xl bg-sand", className || "size-16")}>
      {im && <img src={im.url} alt="" loading="lazy" className="size-full object-cover" />}
    </span>
  );
}

export function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-sand text-olive",
    good: "bg-olive/10 text-olive",
    warn: "bg-gold/20 text-[#7a5f2c]",
    bad: "bg-rose/10 text-rose",
  };
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}
