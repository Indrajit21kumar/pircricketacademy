import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Fees", href: "#fees" },
  { label: "Facilities", href: "#facilities" },
  { label: "Founder", href: "#founder" },
  { label: "Why PIR?", href: "/why-pir", external: true },
  { label: "Book Ground", href: "/booking", external: true },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  const isHome = loc === "/";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      if (!isHome) { window.location.href = "/" + href; return; }
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/pir-logo-400.png" alt="PIR Cricket Academy" className="w-11 h-11 object-contain" />
          <span className={`font-display font-bold text-lg uppercase tracking-tight ${scrolled ? "text-foreground" : "text-white"}`}>
            PIR Cricket<span className="text-secondary"> Academy</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV.map(n => n.external
            ? <Link key={n.label} href={n.href} className={`text-sm font-semibold uppercase tracking-wider hover:text-secondary transition-colors ${scrolled ? "text-foreground/80" : "text-white/90"}`}>{n.label}</Link>
            : <button key={n.label} onClick={() => go(n.href)} className={`text-sm font-semibold uppercase tracking-wider hover:text-secondary transition-colors ${scrolled ? "text-foreground/80" : "text-white/90"}`}>{n.label}</button>
          )}
          <button onClick={() => go("#contact")} className="bg-secondary text-secondary-foreground font-bold uppercase text-sm px-5 py-2.5 rounded-lg hover:bg-secondary/90 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            Register Now
          </button>
        </div>

        <button className={`md:hidden p-2 ${scrolled ? "text-foreground" : "text-white"}`} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border shadow-xl">
          <div className="flex flex-col p-4 gap-3">
            {NAV.map(n => n.external
              ? <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-2 font-semibold uppercase tracking-wider border-b border-border/40 text-foreground">{n.label}</Link>
              : <button key={n.label} onClick={() => go(n.href)} className="text-left py-2 font-semibold uppercase tracking-wider border-b border-border/40 text-foreground">{n.label}</button>
            )}
            <button onClick={() => go("#contact")} className="mt-2 w-full bg-secondary text-secondary-foreground font-bold uppercase py-3 rounded-lg">Register Now</button>
          </div>
        </div>
      )}
    </nav>
  );
}
