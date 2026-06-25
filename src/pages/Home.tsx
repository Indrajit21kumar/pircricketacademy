import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import FoundingBatch from "@/components/FoundingBatch";
import WhyPIRSection from "@/components/WhyPIRSection";
import Programs from "@/components/Programs";
import Facilities from "@/components/Facilities";
import Founder from "@/components/Founder";
import Partners from "@/components/Partners";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AnnouncementBar />
      <Hero />
      <FoundingBatch />
      <WhyPIRSection />
      <Programs />
      <Facilities />
      <Founder />
      <Partners />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
