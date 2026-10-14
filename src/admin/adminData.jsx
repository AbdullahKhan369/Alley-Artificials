import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchProducts } from "../lib/api";

const Ctx = createContext(null);
export const useAdminData = () => useContext(Ctx);

export function AdminDataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  // Pehli dafa hi "loading" dikhta hai. Baad ke reload silent hain, taake open form unmount na ho
  const reload = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([fetchCategories(), fetchProducts({ admin: true })]);
      setCategories(c);
      setProducts(p);
      setStatus("ready");
    } catch (e) {
      setError(e.message);
      setStatus((s) => (s === "ready" ? s : "error"));
      throw e;
    }
  }, []);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const value = useMemo(() => {
    const tops = categories.filter((c) => !c.parent_id);
    return {
      status,
      error,
      reload,
      categories,
      products,
      tops,
      subsOf: (id) => categories.filter((c) => c.parent_id === id),
      catById: Object.fromEntries(categories.map((c) => [c.id, c])),
      patchProduct: (p) => setProducts((l) => l.map((x) => (x.id === p.id ? p : x))),
      removeProduct: (id) => setProducts((l) => l.filter((x) => x.id !== id)),
    };
  }, [categories, products, status, error, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
