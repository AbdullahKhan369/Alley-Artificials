import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchProducts, fetchSettings } from "../lib/api";
import { DEFAULT_SETTINGS } from "../lib/defaults";
import { getSessionSeed, seededShuffle } from "../lib/utils";

const Ctx = createContext(null);
export const useShop = () => useContext(Ctx);

// Splash sirf home par, session mein ek hi baar. Decision pehle render mein hota hai (flash nahi)
const splashAlreadyDone = () => {
  try {
    return sessionStorage.getItem("alley_splash") === "1" || window.location.pathname !== "/";
  } catch {
    return true;
  }
};

export function ShopProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settingsDb, setSettingsDb] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(splashAlreadyDone);
  const [order, setOrder] = useState({ open: false, product: null, preset: {}, nonce: 0 });

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const [c, p, s] = await Promise.all([fetchCategories(), fetchProducts(), fetchSettings()]);
      setCategories(c);
      setProducts(p);
      setSettingsDb(s);
      setStatus("ready");
    } catch (e) {
      setError(e.message || "Something went wrong");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem("alley_splash", "1");
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const value = useMemo(() => {
    const settings = { ...DEFAULT_SETTINGS };
    Object.entries(settingsDb || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") settings[k] = v;
    });
    const tops = categories.filter((c) => !c.parent_id);
    const subsOf = (id) => categories.filter((c) => c.parent_id === id);
    const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
    const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
    const shuffled = seededShuffle(products, getSessionSeed());
    return { categories, products, shuffled, settings, tops, subsOf, catById, catBySlug, status, error, reload: load };
  }, [categories, products, settingsDb, status, error, load]);

  const actions = useMemo(
    () => ({
      ready,
      finishSplash,
      order,
      openOrder: (product = null, preset = {}) => setOrder((o) => ({ open: true, product, preset, nonce: o.nonce + 1 })),
      closeOrder: () => setOrder((o) => ({ ...o, open: false })),
    }),
    [ready, finishSplash, order]
  );

  return <Ctx.Provider value={{ ...value, ...actions }}>{children}</Ctx.Provider>;
}
