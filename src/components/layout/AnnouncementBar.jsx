import { useShop } from "../../context/ShopContext";

export default function AnnouncementBar() {
  const { settings } = useShop();
  if (!settings.announcement?.trim()) return null;
  return (
    <div className="bg-olive-deep px-4 py-2 text-center text-[13px] tracking-wide text-cream/90">{settings.announcement}</div>
  );
}
