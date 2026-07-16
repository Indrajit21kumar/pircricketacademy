import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import FoundingBatch from "@/components/FoundingBatch";
import WhyPIRSection from "@/components/WhyPIRSection";
import Programs from "@/components/Programs";
import Fees from "@/components/Fees";
import Facilities from "@/components/Facilities";
import Founder from "@/components/Founder";
import Partners from "@/components/Partners";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StatsCounter from "@/components/StatsCounter";
import Testimonials from "@/components/Testimonials";
import BatchTimings from "@/components/BatchTimings";
import FAQ from "@/components/FAQ";
import FloatingCTA from "@/components/FloatingCTA";

function FacilityShowcase() {
  return (
    <section className="relative overflow-hidden">
      <img
        src="/images/pir-facility-collage.png"
        alt="PIRcricketHub — World-class cricket facilities in Patna"
        className="w-full object-cover"
        style={{ maxHeight: "600px", objectPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-white/80 text-sm font-semibold uppercase tracking-widest drop-shadow-lg">
          World-class Cricket Infrastructure · Patna, Bihar
        </p>
      </div>
    </section>
  );
}

function AdmissionCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5 border-t border-secondary/10">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-6">Admissions 2026 Open</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to Join PIR<span className="text-secondary">cricket</span>Hub?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Fill out our online admission form in 3 simple steps. Takes less than 5 minutes. We'll contact you within 24 hours to confirm your batch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/admissions"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold uppercase tracking-wide px-10 py-4 rounded-xl hover:bg-secondary/90 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] text-base">
              Apply for Admission Online
            </Link>
            <a href="https://wa.me/918936061688?text=Hi%2C+I+want+to+apply+for+admission+at+PIR+Cricket+Academy"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border text-foreground font-bold uppercase tracking-wide px-8 py-4 rounded-xl hover:border-secondary/40 hover:bg-secondary/5 transition-all text-sm">
              WhatsApp Us Instead
            </a>
          </div>
          <p className="text-muted-foreground text-sm mt-6">Free trial session available · No advance payment required to apply</p>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AnnouncementBar />
      <Hero />
      <StatsCounter />
      <FoundingBatch />
      <WhyPIRSection />
      <Programs />
      <Testimonials />
      <Fees />
      <BatchTimings />
      <Facilities />
      <FacilityShowcase />
      <Founder />
      <Partners />
      <Gallery />
      <AdmissionCTA />
      <FAQ />
      <Contact />
      <Footer />
      <FloatingCTA />
    </main>
  );
}
