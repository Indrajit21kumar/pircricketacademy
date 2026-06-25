import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-32 text-center">
        <div>
          <p className="font-display text-8xl font-black text-secondary opacity-30 mb-4">404</p>
          <h1 className="font-display text-3xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The page you are looking for doesn't exist or has been moved.</p>
          <Link href="/" className="bg-secondary text-secondary-foreground font-bold uppercase px-8 py-3.5 rounded-xl hover:bg-secondary/90 transition-all inline-block">← Back to Home</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
