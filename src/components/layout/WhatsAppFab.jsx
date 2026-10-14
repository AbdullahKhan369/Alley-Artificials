import { MessageCircle } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { waLink } from "../../lib/utils";

export default function WhatsAppFab() {
  const { settings } = useShop();
  return (
    <a
      href={waLink(settings.whatsapp, "Hi Alley Artificals, I need help with an order.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-0 overflow-hidden rounded-full bg-olive-deep text-cream shadow-lift transition-all duration-300 hover:bg-olive"
    >
      <span className="grid size-14 place-items-center">
        <MessageCircle className="size-6" />
      </span>
      <span className="max-w-0 whitespace-nowrap pr-0 text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:pr-5 group-hover:opacity-100">Chat with us</span>
    </a>
  );
}
