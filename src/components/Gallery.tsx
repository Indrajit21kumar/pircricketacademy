import { motion } from "framer-motion";

const photos = [
  { src: "/images/indrajit-trophy.jpeg", caption: "Indrajit Kumar — Trophy Win with Medal", tag: "Achievement" },
  { src: "/images/ranji-team.jpeg", caption: "Bihar Ranji Trophy 2019–20 Team, Balurghat Stadium", tag: "Ranji Trophy" },
  { src: "/images/bihar-team-selfie.jpeg", caption: "Team Celebration after a Bihar Victory", tag: "Team" },
  { src: "/images/team-celebration.jpeg", caption: "Winning Team — Tournament Victory", tag: "Tournament" },
  { src: "/images/trophy-ceremony.jpeg", caption: "Trophy Presentation Ceremony", tag: "Achievement" },
  { src: "/images/award-presentation.jpeg", caption: "Award Ceremony — Player Recognition", tag: "Awards" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-12">
          <span className="inline-block bg-secondary/15 text-secondary border border-secondary/30 rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest mb-4">Gallery</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold">Cricket is Lived,<br /><span className="text-secondary">Not Just Played.</span></h2>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl mx-auto">From Ranji Trophy grounds to tournament wins — a journey built on the soil of Bihar.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map(({ src, caption, tag }, i) => (
            <motion.div
              key={src}
              initial={{opacity:0, scale:0.95}}
              whileInView={{opacity:1, scale:1}}
              viewport={{once:true}}
              transition={{delay: i * 0.07}}
              className="group relative rounded-2xl overflow-hidden border border-border hover:border-secondary/40 transition-all duration-300 aspect-[4/3]"
            >
              <img
                src={src}
                alt={caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-3 left-3">
                <span className="bg-secondary/90 text-secondary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{tag}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-xs font-semibold leading-snug">{caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
