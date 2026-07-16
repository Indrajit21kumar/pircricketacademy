import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, CalendarCheck } from "lucide-react";
import { Link } from "wouter";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3"
        >
          {/* Expanded options */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="flex flex-col gap-2 items-end"
              >
                <a
                  href="tel:+918936061688"
                  className="flex items-center gap-3 bg-card border border-border text-foreground font-bold text-sm px-4 py-3 rounded-2xl shadow-xl hover:border-secondary/40 hover:bg-secondary/5 transition-all"
                >
                  <Phone className="h-4 w-4 text-secondary" />
                  Call Now
                </a>
                <a
                  href="https://wa.me/918936061688?text=Hi%2C+I+want+to+book+a+free+trial+session+at+PIR+Cricket+Academy"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-[#25d366] text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-xl hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </a>
                <Link
                  href="/admissions"
                  className="flex items-center gap-3 bg-secondary text-black font-bold text-sm px-4 py-3 rounded-2xl shadow-xl hover:bg-secondary/90 transition-colors"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book Free Trial
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <button
            onClick={() => setExpanded(v => !v)}
            className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${
              expanded
                ? "bg-card border border-border text-foreground"
                : "bg-[#25d366] text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]"
            }`}
          >
            <AnimatePresence mode="wait">
              {expanded
                ? <motion.div key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }}><X className="h-5 w-5" /></motion.div>
                : <motion.div key="msg" initial={{ rotate: 90 }} animate={{ rotate: 0 }}><MessageCircle className="h-6 w-6" /></motion.div>
              }
            </AnimatePresence>
          </button>

          {/* Pulse ring */}
          {!expanded && (
            <span className="absolute bottom-0 right-0 w-14 h-14 rounded-2xl bg-[#25d366] animate-ping opacity-20 pointer-events-none" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
