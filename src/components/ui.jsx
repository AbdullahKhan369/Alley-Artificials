import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, ChevronDown, Loader2, X } from "lucide-react";
import { cn, formatPrice, isOnSale, salePercent } from "../lib/utils";

/* ---------------- Button ---------------- */
const VARIANTS = {
  primary: "bg-olive text-cream hover:bg-olive-deep shadow-soft",
  gold: "bg-gold text-olive-deep hover:bg-gold-soft",
  outline: "border border-olive/30 text-olive hover:border-olive hover:bg-olive/5",
  ghost: "text-olive hover:bg-olive/10",
  soft: "bg-sand text-olive hover:bg-line",
  cream: "bg-cream text-olive-deep hover:bg-white",
  danger: "bg-rose text-white hover:brightness-90",
  dangerSoft: "bg-rose/10 text-rose hover:bg-rose/20",
};
const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

export function Button({ as: Tag = "button", variant = "primary", size = "md", loading, icon: Icon, className, children, disabled, ...rest }) {
  const extra = Tag === "button" ? { type: rest.type || "button" } : {};
  return (
    <Tag
      {...extra}
      {...rest}
      disabled={Tag === "button" ? disabled || loading : undefined}
      aria-disabled={disabled || loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : Icon ? <Icon className="size-4" /> : null}
      {children}
    </Tag>
  );
}

/* ---------------- Form fields ---------------- */
const fieldBase =
  "w-full rounded-xl border border-line bg-ivory px-4 py-3 text-[15px] text-ink placeholder:text-mute/70 transition focus:border-olive focus:outline-none focus:ring-4 focus:ring-olive/10 disabled:opacity-60";

export function Field({ label, hint, error, required, children, className }) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-olive-deep">
          {label}
          {required && <span className="ml-0.5 text-rose">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1.5 block text-[13px] text-mute">{hint}</span>}
      {error && (
        <span className="mt-1.5 flex items-center gap-1 text-[13px] text-rose">
          <AlertCircle className="size-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

export function Input({ className, ...p }) {
  return <input {...p} className={cn(fieldBase, className)} />;
}
export function Textarea({ className, rows = 4, ...p }) {
  return <textarea rows={rows} {...p} className={cn(fieldBase, "resize-y leading-relaxed", className)} />;
}
export function Select({ className, children, ...p }) {
  return (
    <span className="relative block">
      <select {...p} className={cn(fieldBase, "appearance-none pr-10", className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" />
    </span>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-ivory px-4 py-3">
      <div>
        <p className="text-[15px] font-medium text-olive-deep">{label}</p>
        {hint && <p className="text-[13px] text-mute">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-olive" : "bg-line")}
      >
        <span className={cn("absolute top-0.5 size-6 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function Chip({ active, onClick, children, className, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all duration-200",
        active ? "border-olive bg-olive text-cream" : "border-line bg-ivory text-olive hover:border-olive/50",
        className
      )}
    >
      {children}
      {count != null && <span className={cn("text-xs", active ? "text-cream/70" : "text-mute")}>{count}</span>}
    </button>
  );
}

/* ---------------- Price (screenshot wala style: sale price + cut price + % pill) ---------------- */
export function PriceTag({ product, size = "md", className }) {
  const sale = isOnSale(product);
  const sizes = { sm: "text-[15px]", md: "text-lg", lg: "text-3xl" };
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}>
      <span className={cn("font-medium text-olive", sizes[size])}>{formatPrice(sale ? product.sale_price : product.price)}</span>
      {sale && (
        <>
          <s className={cn("text-mute/80", size === "lg" ? "text-lg" : "text-sm")}>{formatPrice(product.price)}</s>
          <span
            className={cn(
              "rounded-full bg-rose font-medium text-white",
              size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs"
            )}
          >
            -{salePercent(product)}%
          </span>
        </>
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-olive-deep/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-3xl bg-cream shadow-lift sm:rounded-3xl",
              wide ? "sm:max-w-3xl" : "sm:max-w-xl"
            )}
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h2 className="text-2xl">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full text-olive transition hover:bg-olive/10">
                <X className="size-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-line bg-ivory px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, title, message, confirmText = "Delete", onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="soft" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-[15px] leading-relaxed text-ink/80">{message}</p>
    </Modal>
  );
}

/* ---------------- Toasts ---------------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);
  const toast = useCallback((message, type = "success") => {
    const id = ++idRef.current;
    setItems((x) => [...x, { id, message, type }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                "pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-5 py-3 text-[15px] text-white shadow-lift",
                t.type === "error" ? "bg-rose" : "bg-olive-deep"
              )}
              role="status"
            >
              {t.type === "error" ? <AlertCircle className="size-5 shrink-0" /> : <Check className="size-5 shrink-0 text-gold-soft" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- Misc ---------------- */
export const Spinner = ({ className }) => <Loader2 className={cn("size-6 animate-spin text-olive", className)} />;

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-ivory/60 px-6 py-14 text-center">
      {Icon && (
        <span className="grid size-14 place-items-center rounded-full bg-sand text-olive">
          <Icon className="size-6" />
        </span>
      )}
      <h3 className="text-2xl">{title}</h3>
      {text && <p className="text-[15px] text-mute">{text}</p>}
      {action}
    </div>
  );
}

export const SocialIcon = {
  Instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  Facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
    </svg>
  ),
  TikTok: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2.1 4.2 5 4.4" />
    </svg>
  ),
};
