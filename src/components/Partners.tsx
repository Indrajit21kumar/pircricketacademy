import { motion } from "framer-motion";

export default function Partners() {
  return (
    <section className="py-14 border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.p initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10">
          Association & Support
        </motion.p>
        <div className="grid sm:grid-cols-3 gap-6">

          {/* S.P Sports */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0}}
            className="bg-gradient-to-br from-blue-900/30 to-blue-950/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
            <a href="https://www.facebook.com/profile.php?id=100091814124518" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/sp-sports-logo.png" alt="S.P Sports & Cultural Organisation" className="w-20 h-20 object-contain" />
            </a>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mt-4 mb-1">Under the Aegis of</p>
            <a href="https://www.facebook.com/profile.php?id=100091814124518" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
              <p className="font-display font-bold text-base text-foreground leading-snug">S.P Sports & Cultural Organisation</p>
            </a>
            <p className="text-muted-foreground text-xs mt-1">Patna, Bihar</p>
          </motion.div>

          {/* PIR Academy */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}
            className="bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/30 rounded-2xl p-6 flex flex-col items-center text-center">
            <a href="https://pircricketacademy.co.in/" className="hover:opacity-80 transition-opacity">
              <img src="/images/pir-logo-400.png" alt="PIRcricketHub" className="w-20 h-20 object-contain" />
            </a>
            <p className="text-xs font-semibold uppercase tracking-wider text-secondary mt-4 mb-1">The Academy</p>
            <a href="https://pircricketacademy.co.in/" className="hover:text-secondary transition-colors">
              <p className="font-display font-bold text-base text-foreground leading-snug">PIRcricketHub</p>
            </a>
            <p className="text-muted-foreground text-xs mt-1">Sector-A, Police Colony, Anisabad, Patna – 800002</p>
          </motion.div>

          {/* Savera */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.2}}
            className="bg-gradient-to-br from-red-900/20 to-red-950/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
            <a href="https://www.saverahospital.org/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="/images/savera-logo.png" alt="Savera Cancer & Multi Speciality Hospital" className="w-20 h-20 object-contain" />
            </a>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mt-4 mb-1">Powered by</p>
            <a href="https://www.saverahospital.org/" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">
              <p className="font-display font-bold text-base text-foreground leading-snug">Savera Cancer & Multi Speciality Hospital</p>
            </a>
            <p className="text-muted-foreground text-xs mt-1">Dr. V.P. Singh, Director · Health · Healing · Hope</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
