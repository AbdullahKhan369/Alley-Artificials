import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "../../context/ShopContext";

// Brand intro: session mein ek baar, sirf home par. `ready` pehle render se hi sahi hota hai, isliye peeche ka hero jhalakta nahi.
export default function Splash() {
  const { ready, finishSplash } = useShop();

  useEffect(() => {
    if (ready) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(finishSplash, 2300);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [ready, finishSplash]);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="splash"
          className="light-beam fixed inset-0 z-[200] grid place-items-center"
          exit={{ y: "-100%", transition: { duration: 0.95, ease: [0.76, 0, 0.24, 1] } }}
        >
          <div className="flex flex-col items-center gap-5 px-6">
            <motion.img
              src="/logo-mark.png"
              alt=""
              className="h-36 w-auto sm:h-44"
              initial={{ opacity: 0, scale: 0.86, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.img
              src="/logo-name.png"
              alt="Alley Artificals"
              className="h-5 w-auto sm:h-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
            <motion.span
              className="h-px w-40 origin-center bg-gold"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.9, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
