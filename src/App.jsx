import { Suspense, lazy, useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ShopProvider, useShop } from "./context/ShopContext";
import { isConfigured } from "./lib/supabase";
import Splash from "./components/layout/Splash";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import WhatsAppFab from "./components/layout/WhatsAppFab";
import OrderModal from "./components/shop/OrderModal";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import SetupNeeded from "./pages/SetupNeeded";
import { Button, Spinner } from "./components/ui";

const AdminApp = lazy(() => import("./admin/AdminApp"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function DataError() {
  const { error, reload } = useShop();
  const schemaMissing = /relation|does not exist|schema cache/i.test(error);
  return (
    <div className="container-x grid min-h-[50svh] place-items-center py-20 text-center">
      <div className="grid max-w-md justify-items-center gap-3">
        <h1 className="text-4xl">We could not load the shop</h1>
        <p className="text-[15px] text-mute">
          {schemaMissing ? "The database tables are missing. Run supabase/schema.sql in the Supabase SQL Editor." : error}
        </p>
        <Button onClick={reload}>Try again</Button>
      </div>
    </div>
  );
}

function PublicShell() {
  const { status } = useShop();
  return (
    <>
      <Splash />
      <AnnouncementBar />
      <Navbar />
      <main id="main" className="min-h-[60svh]">{status === "error" ? <DataError /> : <Outlet />}</main>
      <Footer />
      <WhatsAppFab />
      <OrderModal />
    </>
  );
}

export default function App() {
  if (!isConfigured) return <SetupNeeded />;
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="grid min-h-svh place-items-center"><Spinner /></div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route
          element={
            <ShopProvider>
              <PublicShell />
            </ShopProvider>
          }
        >
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop mode="all" />} />
          <Route path="sale" element={<Shop mode="sale" />} />
          <Route path="category/:slug" element={<Shop mode="category" />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
