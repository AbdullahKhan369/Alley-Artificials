import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { checkIsAdmin } from "../lib/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(true);
      // callback ke andar seedha supabase call nahi karte (deadlock se bachne ke liye), isliye setTimeout
      setTimeout(async () => {
        setIsAdmin(await checkIsAdmin(s?.user?.id));
        setLoading(false);
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message === "Invalid login credentials" ? "Email or password is wrong" : error.message);
  };
  const signOut = () => supabase.auth.signOut();

  return <Ctx.Provider value={{ session, isAdmin, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}
