import { Link } from "wouter";
import { Phone, MessageCircle, MapPin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/pir-logo-400.png" alt="PIRcricketHub" className="w-10 h-10 object-contain" />
              <span className="font-display font-bold text-lg uppercase">PIRcricket<span className="text-secondary">Hub</span></span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xs">
              Train Like a Champion. Progress Like a Professional.<br />
              Founded by Former Bihar Ranji Trophy Cricketer Indrajit Kumar.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/pircricketacademy" target="_blank" rel="noreferrer" className="w-9 h-9 bg-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/50 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="https://facebook.com/pircricketacademy" target="_blank" rel="noreferrer" className="w-9 h-9 bg-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="https://wa.me/918936061688" target="_blank" rel="noreferrer" className="w-9 h-9 bg-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <p className="font-bold text-sm uppercase tracking-wider mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {[["About Academy","#about"],["Programs","#programs"],["Facilities","#facilities"],["Founder Story","#founder"],["Contact","#contact"]].map(([l,h])=>(
                <li key={l}><button onClick={()=>go(h.slice(1))} className="text-muted-foreground text-sm hover:text-secondary transition-colors">{l}</button></li>
              ))}
              <li><Link href="/why-pir" className="text-muted-foreground text-sm hover:text-secondary transition-colors">Why PIR?</Link></li>
              <li><Link href="/booking" className="text-muted-foreground text-sm hover:text-secondary transition-colors">Book Ground</Link></li>
              <li><Link href="/admissions" className="text-muted-foreground text-sm hover:text-secondary transition-colors">Admissions</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-sm uppercase tracking-wider mb-4">Contact</p>
            <div className="space-y-3">
              <a href="tel:+918936061688" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-secondary transition-colors"><Phone className="h-4 w-4 shrink-0" />+91 89360 61688</a>
              <a href="https://wa.me/918936061688" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-secondary transition-colors"><MessageCircle className="h-4 w-4 shrink-0" />WhatsApp Us</a>
              <div className="flex items-start gap-2 text-muted-foreground text-sm"><MapPin className="h-4 w-4 shrink-0 mt-0.5" />Sector-A, Police Colony<br />Anisabad, Patna, Bihar</div>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 PIRcricketHub. All rights reserved.</p>
          <a href="https://www.pircricketacademy.co.in" className="text-secondary hover:text-secondary/80 transition-colors font-semibold">pircricketacademy.co.in</a>
        </div>
      </div>
    </footer>
  );
}
