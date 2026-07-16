import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";

const FAQS = [
  {
    q: "What age can my child start cricket training at PIR?",
    a: "We welcome students from age 6 onwards in our Foundation batch (U10). Our youngest students use a soft ball and modified pitch — safety and enjoyment come first. There is no upper age limit for the Senior batch.",
  },
  {
    q: "Do you need any prior cricket experience to join?",
    a: "Absolutely not. Our Foundation and Junior batches are designed for complete beginners. We start from scratch — correct grip, stance, and basic rules. Experienced players join the Youth or Senior batches based on a short skill assessment.",
  },
  {
    q: "How is PIR different from a regular coaching centre?",
    a: "PIR follows a documented 12-month curriculum aligned with ICC, BCCI, ECB, and Cricket Australia frameworks. Every session has a written plan — not a coach's personal preference. This means your child's training is consistent, progressive, and globally benchmarked — regardless of which coach is present.",
  },
  {
    q: "Are the coaches BCCI certified?",
    a: "Yes. All PIR coaches hold BCCI NCA Level 1 or Level 2 certification. They are trained to deliver our structured curriculum, not freestyle sessions. Indrajit Kumar, the founder, is personally involved in coach training and curriculum delivery.",
  },
  {
    q: "What is included in the admission fee?",
    a: "Admission includes full access to your age-group batch sessions, the 12-month curriculum, a student portal with attendance and performance tracking, QR attendance card, monthly progress reports, and parent consultation sessions every quarter.",
  },
  {
    q: "Can I book a free trial session before paying?",
    a: "Yes. We offer one complimentary trial session for all new students. This lets your child experience the training environment, meet the coaches, and see our facility before you commit. Book via WhatsApp or the Admission form.",
  },
  {
    q: "What is the batch size? Will my child get personal attention?",
    a: "We strictly cap batches at 15 students. Unlike large coaching camps, this ensures each student gets individual feedback every session. Our coach-to-student ratio is 1:7 maximum.",
  },
  {
    q: "Is there a curriculum for girls?",
    a: "Yes. Our curriculum is gender-inclusive and all batches welcome girls. We have several female students across Foundation and Junior batches currently. The training content, standards, and coach quality are identical.",
  },
  {
    q: "How do parents track their child's progress?",
    a: "Every student gets a digital Student Portal where they can see their attendance record, coach ratings, and performance scores after each assessment phase. Parents receive a written progress report every 2 months and a verbal consultation quarterly.",
  },
  {
    q: "Where is PIR Cricket Academy located?",
    a: "We are located at Sector-A, Police Colony, Anisabad, Patna – 800002, Bihar. The facility has a full-size cricket ground, practice nets, and modern training infrastructure.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-card/20" id="faq">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            FAQs
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Parents <span className="text-secondary">Ask Us</span>
          </h2>
          <p className="text-muted-foreground mt-2">Everything you need to know before enrolling</p>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? "border-secondary/40 bg-secondary/5 shadow-md" : "border-border bg-card"}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-foreground text-sm md:text-base">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180 text-secondary" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">Still have questions? We reply within 1 hour on WhatsApp.</p>
          <a
            href="https://wa.me/918936061688?text=Hi%2C+I+have+a+question+about+PIR+Cricket+Academy"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
          >
            <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
