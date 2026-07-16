import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, User, GraduationCap, ShieldCheck } from "lucide-react";

const NAV = [
  { label: "Home",       href: "/",         external: true },
  { label: "About",      href: "#about" },
  { label: "Programs",   href: "#programs" },
  { label: "Fees",       href: "#fees" },
  { label: "Facilities", href: "#facilities" },
  { label: "Founder",    href: "#founder" },
  { label: "Why PIR?",   href: "/why-pir",    external: true },
  { label: "Curriculum", href: "/curriculum", external: true },
  { label: "Book Ground",href: "/booking",    external: true },
  { label: "Contact",    href: "#contact" },
];

const PORTALS = [
  { label: "Student Login", href: "/student", icon: GraduationCap, desc: "View attendance, fees & performance" },
  { label: "Coach Login",   href: "/coach",   icon: User,           desc: "Session notes, ratings & batches" },
  { label: "Admin Login",   href: "/admin",   icon: ShieldCheck,    desc: "Full academy management" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [loc] = useLocation();
  const isHome = loc === "/";
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setPortalOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setPortalOpen(false);
    if (href.startsWith("#")) {
      if (!isHome) { window.location.href = "/" + href; return; }
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`fixed top-9 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 flex items-center">
        {/* Logo — always left */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/images/pir-logo-400.png" alt="PIRcricketHub" className="w-10 h-10 object-contain" />
          <span className={`font-display font-bold text-base whitespace-nowrap leading-none ${scrolled ? "text-foreground" : "text-white"}`}>
            PIR<span className="text-secondary">cricket</span><span className={scrolled ? "text-foreground" : "text-white"}>Hub</span>
          </span>
        </Link>

        {/* Desktop nav — centered */}
        <div className="hidden xl:flex items-center gap-4 mx-auto">
          {NAV.map(n => n.external
            ? <Link key={n.label} href={n.href} className={`text-xs font-bold uppercase tracking-wider hover:text-secondary transition-colors ${scrolled ? "text-foreground/80" : "text-white/90"}`}>{n.label}</Link>
            : <button key={n.label} onClick={() => go(n.href)} className={`text-xs font-bold uppercase tracking-wider hover:text-secondary transition-colors ${scrolled ? "text-foreground/80" : "text-white/90"}`}>{n.label}</button>
          )}
        </div>

        {/* Right side: Login + Register */}
        <div className="hidden xl:flex items-center gap-3 ml-auto shrink-0">
          {/* Login dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setPortalOpen(v => !v)}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:text-secondary transition-colors ${scrolled ? "text-foreground/80" : "text-white/90"}`}
            >
              Login <ChevronDown className={`h-3.5 w-3.5 transition-transform ${portalOpen ? "rotate-180" : ""}`} />
            </button>
            {portalOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {PORTALS.map(p => (
                  <Link key={p.label} href={p.href} onClick={() => setPortalOpen(false)}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-secondary/10 transition-colors group border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-secondary/20 transition-colors">
                      <p.icon className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{p.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/admissions" className="bg-secondary text-secondary-foreground font-bold uppercase text-xs px-4 py-2.5 rounded-lg hover:bg-secondary/90 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            Admission
          </Link>
        </div>

        {/* Hamburger — small/medium screens */}
        <button className={`xl:hidden ml-auto p-2 ${scrolled ? "text-foreground" : "text-white"}`} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden bg-background border-t border-border shadow-xl">
          <div className="flex flex-col p-4 gap-3">
            {NAV.map(n => n.external
              ? <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-2 font-semibold uppercase tracking-wider border-b border-border/40 text-foreground">{n.label}</Link>
              : <button key={n.label} onClick={() => go(n.href)} className="text-left py-2 font-semibold uppercase tracking-wider border-b border-border/40 text-foreground">{n.label}</button>
            )}
            {/* Mobile portal links */}
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2 mb-1">Portals</p>
            {PORTALS.map(p => (
              <Link key={p.label} href={p.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2 border-b border-border/40 text-foreground">
                <p.icon className="h-4 w-4 text-secondary" />
                <span className="font-semibold uppercase tracking-wider">{p.label}</span>
              </Link>
            ))}
            <Link href="/admissions" onClick={() => setOpen(false)} className="mt-2 w-full bg-secondary text-secondary-foreground font-bold uppercase py-3 rounded-lg text-center block">Admission</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
