import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BadgePercent, ClipboardList, ExternalLink, LayoutDashboard, LogOut, Menu, Package, Settings as Cog, Tags, X } from "lucide-react";
import { AuthProvider, useAuth } from "./auth";
import { AdminDataProvider, useAdminData } from "./adminData";
import { Button, Spinner } from "../components/ui";
import { cn } from "../lib/utils";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProductsList from "./ProductsList";
import ProductForm from "./ProductForm";
import Categories from "./Categories";
import SalePage from "./SalePage";
import Orders from "./Orders";
import Settings from "./Settings";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/sale", label: "Sale", icon: BadgePercent },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/settings", label: "Website settings", icon: Cog },
];

function SidebarContent({ onNavigate }) {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-4 pt-7">
        <img src="/logo-mark-cream.png" alt="" className="h-12 w-auto" />
        <p className="mt-3 font-display text-2xl text-cream">Alley Artificals</p>
        <p className="text-sm text-cream/55">Admin panel</p>
      </div>
      <nav className="mt-4 flex-1 space-y-1.5 px-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn("flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-base transition", isActive ? "bg-cream text-olive-deep shadow-soft" : "text-cream/80 hover:bg-cream/10 hover:text-cream")
            }
          >
            <Icon className="size-5" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-cream/10 p-4">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-cream/80 transition hover:bg-cream/10">
          <ExternalLink className="size-5" /> View website
        </a>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-cream/80 transition hover:bg-cream/10">
          <LogOut className="size-5" /> Sign out
        </button>
      </div>
    </div>
  );
}

function Layout() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    document.title = "Admin | Alley Artificals";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);

  if (loading) return <div className="grid min-h-svh place-items-center"><Spinner /></div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)
    return (
      <div className="grid min-h-svh place-items-center p-6 text-center">
        <div className="grid max-w-md justify-items-center gap-4">
          <h1 className="text-4xl">No admin access</h1>
          <p className="text-[15px] text-mute">You are signed in as {session.user.email}, but this account is not in the admins list. Follow step 4 in README, then sign in again.</p>
          <Button onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );

  return (
    <AdminDataProvider>
      <div className="min-h-svh bg-cream text-[17px]">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-olive-deep lg:block">
          <SidebarContent />
        </aside>

        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="grid size-12 place-items-center rounded-full bg-olive text-cream">
            <Menu className="size-6" />
          </button>
          <span className="font-display text-2xl text-olive-deep">Admin</span>
        </header>

        <AnimatePresence>
          {drawer && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div className="absolute inset-0 bg-olive-deep/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-olive-deep" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.3 }}>
                <button onClick={() => setDrawer(false)} aria-label="Close menu" className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-cream hover:bg-cream/10">
                  <X className="size-5" />
                </button>
                <SidebarContent onNavigate={() => setDrawer(false)} />
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="px-4 pb-32 pt-6 md:px-8 md:pt-10 lg:pl-80 lg:pr-10">
          <div className="mx-auto max-w-6xl">
            <DataGate />
          </div>
        </main>
      </div>
    </AdminDataProvider>
  );
}

function DataGate() {
  const { status, error, reload } = useAdminData();
  if (status === "loading") return <div className="grid min-h-[40svh] place-items-center"><Spinner /></div>;
  if (status === "error")
    return (
      <div className="grid justify-items-center gap-3 py-16 text-center">
        <h2 className="text-3xl">Could not load data</h2>
        <p className="max-w-md text-[15px] text-mute">{error}</p>
        <Button onClick={() => reload().catch(() => {})}>Try again</Button>
      </div>
    );
  return <Outlet />;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sale" element={<SalePage />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
