import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "./auth";
import { Button, Field, Input } from "../components/ui";

export default function Login() {
  const { signIn, session, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && session && isAdmin) nav("/admin", { replace: true });
  }, [loading, session, isAdmin, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="light-beam grid min-h-svh place-items-center p-5">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-ivory p-8 shadow-lift md:p-10">
        <img src="/logo-mark.png" alt="" className="mx-auto h-16 w-auto" />
        <h1 className="mt-5 text-center text-4xl">Admin sign in</h1>
        <p className="mt-2 text-center text-[15px] text-mute">Manage products, categories, sales and orders.</p>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          </Field>
          <Field label="Password">
            <div className="relative">
              <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="pr-12" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-olive">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </Field>
          {error && <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-[15px] text-rose">{error}</p>}
          {!loading && session && !isAdmin && <p role="alert" className="rounded-xl bg-rose/10 px-4 py-3 text-[15px] text-rose">This account is not an admin yet. Follow step 4 in README.</p>}
          <Button type="submit" size="lg" loading={busy} icon={Lock}>Sign in</Button>
        </form>
        <Link to="/" className="mt-6 block text-center text-sm text-olive hover:underline">Back to website</Link>
      </div>
    </div>
  );
}
