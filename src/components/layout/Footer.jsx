import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { SocialIcon } from "../ui";
import { cleanPhone, waLink } from "../../lib/utils";

export default function Footer() {
  const { tops, settings, openOrder } = useShop();
  const socials = [
    { href: settings.instagram, Icon: SocialIcon.Instagram, label: "Instagram" },
    { href: settings.facebook, Icon: SocialIcon.Facebook, label: "Facebook" },
    { href: settings.tiktok, Icon: SocialIcon.TikTok, label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-24 bg-olive-deep text-cream/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src="/logo-mark-cream.png" alt="" className="h-16 w-auto" />
          <img src="/logo-word-cream.png" alt="Alley Artificals, floral, gifts and jewelry" className="mt-4 w-72 max-w-full" />
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-cream/70">Premium artificial florals, handmade floral jewelry and custom gift hampers. Beautiful, elegant and made to last.</p>
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border border-cream/20 text-cream transition hover:border-gold hover:text-gold">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-3">
          <h3 className="font-display text-2xl text-cream">Shop</h3>
          <ul className="mt-5 space-y-3 text-[15px]">
            <li><Link className="transition hover:text-gold" to="/shop">All pieces</Link></li>
            {tops.map((c) => (
              <li key={c.id}><Link className="transition hover:text-gold" to={`/category/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link className="transition hover:text-gold" to="/sale">Sale</Link></li>
            <li><button className="transition hover:text-gold" onClick={() => openOrder(null)}>Custom order</button></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="font-display text-2xl text-cream">Visit or message us</h3>
          <ul className="mt-5 space-y-4 text-[15px]">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>{settings.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-gold" />
              <a href={`tel:+${cleanPhone(settings.phone)}`} className="transition hover:text-gold">{settings.phone}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" />
              <a href={`mailto:${settings.email}`} className="break-all transition hover:text-gold">{settings.email}</a>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-gold" />
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="transition hover:text-gold">Chat on WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-sm text-cream/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Alley Artificals. All rights reserved.</p>
          <p>Orders are confirmed on WhatsApp. No online payment on this site.</p>
        </div>
      </div>
    </footer>
  );
}
