import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Alley Artificals` : "Alley Artificals | Floral, Gifts & Jewelry";
  }, [title]);
}
