import { motion } from "framer-motion";
import { useState } from "react";
import { Phone, MessageCircle, MapPin, Send, CheckCircle, Map, Mail } from "lucide-react";

const AGE_GROUPS = ["U8 (Under 8)","U12 (Under 12)","U16 (Under 16)","U19 (Under 19)","Elite","Not sure"];
const SOURCES = ["WhatsApp","Instagram","Facebook","Friend/Family Referral","Google Search","School","Walk-in","Other"];

export default function Contact() {
  const [form, setForm] = useState({ name:"", phone:"", email:"", childName:"", ageGroup:"", address:"", source:"", message:"" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const msg = [
      `🏏 *New Admission Enquiry — PIR Cricket Academy*`,
      ``,
      `👤 *Parent Name:* ${form.name}`,
      `📞 *Phone:* ${form.phone}`,
      form.email ? `📧 *Email:* ${form.email}` : null,
      `🧒 *Child's Name:* ${form.childName}`,
      `📅 *Age Group:* ${form.ageGroup}`,
      `🏠 *Address:* ${form.address}`,
      form.source ? `📣 *How they heard:* ${form.source}` : null,
      form.message ? `💬 *Message:* ${form.message}` : null,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/918936061688?text=${encodeURIComponent(msg)}`, "_blank");
    setLoading(false);
    setSent(true);
  };

  if (sent) return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="bg-card border border-secondary/30 rounded-2xl p-12">
          <div className="w-20 h-20 bg-secondary/10 border-2 border-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-secondary" />
          </div>
          <h3 className="font-display text-3xl font-bold mb-3">Registration Received!</h3>
          <p className="text-muted-foreground text-base mb-2">Thank you, <strong className="text-foreground">{form.name}</strong>.</p>
          <p className="text-muted-foreground text-sm mb-5">We will contact you on <strong className="text-foreground">{form.phone}</strong> within 24 hours to discuss batch availability and next steps.</p>
          <a
            href={`https://wa.me/918936061688?text=Hi%2C%20I%20just%20registered%20interest%20for%20${encodeURIComponent(form.childName)}%20(${encodeURIComponent(form.ageGroup)})%20at%20PIR%20Cricket%20Academy.`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-bold uppercase text-sm px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" /> Also WhatsApp Us
          </a>
          <p className="text-secondary font-bold text-sm mt-4 uppercase tracking-wide">PIR Cricket Academy — Patna</p>
        </motion.div>
      </div>
    </section>
  );

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-secondary/5 to-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">Register Interest</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Start Your Cricket Journey<br /><span className="text-secondary">Today</span></h2>
          <p className="text-muted-foreground text-lg">Register your interest for free. We will contact you within 24 hours.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          <div className="space-y-5">
            <motion.a href="tel:+918936061688" initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-secondary/40 transition-colors">
              <div className="bg-secondary/10 rounded-lg p-3 shrink-0"><Phone className="h-5 w-5 text-secondary" /></div>
              <div>
                <p className="font-bold text-sm uppercase tracking-wider mb-1">Call / WhatsApp</p>
                <p className="text-secondary font-bold">+91 89360 61688</p>
                <p className="text-secondary font-bold">+91 93341 01688</p>
                <p className="text-muted-foreground text-xs mt-0.5">Mon–Sat · 7am–8pm</p>
              </div>
            </motion.a>
            <motion.a href="https://wa.me/918936061688?text=Hi%2C%20I%20want%20to%20know%20more%20about%20PIR%20Cricket%20Academy%20admissions." target="_blank" rel="noreferrer" initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:0.1}} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-secondary/40 transition-colors">
              <div className="bg-secondary/10 rounded-lg p-3 shrink-0"><MessageCircle className="h-5 w-5 text-secondary" /></div>
              <div><p className="font-bold text-sm uppercase tracking-wider mb-1">WhatsApp</p><p className="text-secondary font-bold">+91 89360 61688</p><p className="text-muted-foreground text-xs mt-0.5">Quick response</p></div>
            </motion.a>
            <motion.a href="mailto:PIRcricketHub@gmail.com" initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:0.2}} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-secondary/40 transition-colors">
              <div className="bg-secondary/10 rounded-lg p-3 shrink-0"><Mail className="h-5 w-5 text-secondary" /></div>
              <div><p className="font-bold text-sm uppercase tracking-wider mb-1">Email</p><p className="text-secondary font-bold text-xs break-all">PIRcricketHub@gmail.com</p><p className="text-muted-foreground text-xs mt-0.5">General enquiries</p></div>
            </motion.a>
            <motion.div initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:0.3}} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5">
              <div className="bg-secondary/10 rounded-lg p-3 shrink-0"><MapPin className="h-5 w-5 text-secondary" /></div>
              <div><p className="font-bold text-sm uppercase tracking-wider mb-1">Location</p><p className="text-foreground/80 text-sm">Sector-A, Police Colony<br />Anisabad, Patna, Bihar</p></div>
            </motion.div>
            <motion.a href="https://maps.google.com/?q=Anisabad+Patna+Bihar" target="_blank" rel="noreferrer" initial={{opacity:0,x:-10}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:0.4}} className="flex items-center gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-4 hover:bg-secondary/20 transition-colors">
              <Map className="h-5 w-5 text-secondary shrink-0" />
              <span className="text-secondary font-bold text-sm">Open in Google Maps →</span>
            </motion.a>
          </div>

          <motion.form initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} onSubmit={submit} className="md:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Your Name *</label>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Ramesh Kumar" /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Phone Number *</label>
                <input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="+91 98765 43210" /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Child's Name *</label>
                <input required value={form.childName} onChange={e=>setForm({...form,childName:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="Arjun Kumar" /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Age Group *</label>
                <select required value={form.ageGroup} onChange={e=>setForm({...form,ageGroup:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors">
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map(a=><option key={a} value={a}>{a}</option>)}
                </select></div>
            </div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Student's Address *</label>
              <input required value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors" placeholder="House No., Area, Patna, Bihar" /></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">How did you hear about us?</label>
              <select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors">
                <option value="">Select source</option>
                {SOURCES.map(s=><option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Message (optional)</label>
              <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={3} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-secondary transition-colors resize-none" placeholder="Any questions or specific requirements..." /></div>

            <button type="submit" disabled={loading} className="w-full bg-secondary text-secondary-foreground font-bold uppercase tracking-wide py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center justify-center gap-2 text-base disabled:opacity-60">
              {loading ? "Sending..." : <><Send className="h-5 w-5" />Register My Interest</>}
            </button>
            <p className="text-center text-muted-foreground text-xs">Free registration · We contact you within 24 hours · No commitment required</p>
          </motion.form>
        </div>

        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="rounded-2xl overflow-hidden border border-border h-56">
          <iframe
            title="PIR Cricket Academy Location — Anisabad, Patna"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3597.0!2d85.1376!3d25.5941!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed58e1d7a65555%3A0x0!2sAnisabad%2C%20Patna%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000"
            width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </div>
    </section>
  );
}
