import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  Shield, ArrowRight, Factory, Truck, Store, User, Lock, Eye, Zap, Globe,
  ChevronDown, Blocks, ScanLine, BadgeCheck, Moon, Sun,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

const Particles = () => {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 3 + 1, duration: Math.random() * 20 + 10, delay: Math.random() * 5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-primary/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], x: [0, Math.random() * 20 - 10, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let s = 0; const step = Math.ceil(target / 60);
    const id = setInterval(() => { s += step; if (s >= target) { setCount(target); clearInterval(id); } else setCount(s); }, 20);
    return () => clearInterval(id);
  }, [started, target]);
  return <span ref={ref} className="font-display font-bold text-4xl md:text-5xl text-gradient">{count.toLocaleString()}{suffix}</span>;
};

const GridBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <div className="absolute inset-0" style={{
      backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }} />
  </div>
);

const chainSteps = [
  { icon: Factory, label: "Manufacturer", color: "from-chain-manufacturer to-chain-manufacturer/70", glow: "shadow-[0_0_30px_hsl(var(--chain-manufacturer)/0.4)]" },
  { icon: Truck, label: "Distributor", color: "from-chain-distributor to-chain-distributor/70", glow: "shadow-[0_0_30px_hsl(var(--chain-distributor)/0.4)]" },
  { icon: Store, label: "Retailer", color: "from-chain-retailer to-chain-retailer/70", glow: "shadow-[0_0_30px_hsl(var(--chain-retailer)/0.4)]" },
  { icon: User, label: "Customer", color: "from-chain-customer to-chain-customer/70", glow: "shadow-[0_0_30px_hsl(var(--chain-customer)/0.4)]" },
];

const features = [
  { title: "Blockchain Verified", desc: "Every handoff is recorded on-chain for tamper-proof traceability.", icon: Lock, accent: "chain-manufacturer" },
  { title: "Real-Time Tracking", desc: "Monitor products moving through the supply chain as it happens.", icon: Eye, accent: "chain-distributor" },
  { title: "Full Transparency", desc: "Give consumers complete confidence with product history.", icon: Globe, accent: "chain-retailer" },
  { title: "Instant Verification", desc: "Scan QR codes for instant product authenticity checks.", icon: ScanLine, accent: "chain-customer" },
];

const stats = [
  { value: 10000, suffix: "+", label: "Products Tracked" },
  { value: 500, suffix: "+", label: "Supply Chain Actors" },
  { value: 99, suffix: "%", label: "Verification Rate" },
  { value: 24, suffix: "/7", label: "Monitoring" },
];

const steps = [
  { icon: Factory, title: "Create", desc: "Manufacturer registers product on blockchain" },
  { icon: Truck, title: "Transport", desc: "Distributor records transit details & conditions" },
  { icon: Store, title: "Retail", desc: "Retailer confirms receipt and shelf placement" },
  { icon: BadgeCheck, title: "Verify", desc: "Anyone can scan & verify full product history" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } } as const;
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring" as const, bounce: 0.3 } } };

const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* NAV */}
      <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
              className="h-9 w-9 rounded-xl bg-hero-gradient flex items-center justify-center shadow-glow">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight">Crypsia</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </Button>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/track">Track Product</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/login" className="flex items-center gap-1.5">Get Started <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} className="relative pt-28 pb-24 md:pt-40 md:pb-32 px-4">
        <Particles />
        <GridBg />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative container max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
              <Blocks className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-display font-medium text-primary tracking-widest uppercase">Blockchain-Powered Traceability</span>
            </motion.div>
          </motion.div>

          <motion.h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold leading-[0.95] mb-8 tracking-tight"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            Track Every Product<br />
            <span className="text-gradient">Source to Shelf</span>
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            Crypsia brings tamper-proof transparency to your supply chain. Verify authenticity, prevent counterfeits, and build unshakable consumer trust.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button variant="hero" size="lg" asChild className="text-base px-8 h-12">
                <Link to="/register">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button variant="hero-outline" size="lg" asChild className="text-base px-8 h-12">
                <Link to="/track">Track a Product</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Supply chain visual */}
          <motion.div className="mt-24 flex items-center justify-center gap-3 md:gap-6 flex-wrap"
            variants={stagger} initial="hidden" animate="show">
            {chainSteps.map((step, i) => (
              <motion.div key={step.label} variants={scaleIn} className="flex items-center gap-3 md:gap-6">
                <motion.div className="flex flex-col items-center gap-3 cursor-pointer"
                  whileHover={{ scale: 1.12, y: -8 }} transition={{ type: "spring", stiffness: 300 }}
                  onHoverStart={() => setHoveredStep(i)} onHoverEnd={() => setHoveredStep(null)}>
                  <div className={`relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center ${step.glow} transition-shadow duration-300`}>
                    <step.icon className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
                    <AnimatePresence>
                      {hoveredStep === i && (
                        <motion.div className="absolute -inset-1 rounded-2xl border-2 border-primary-foreground/30"
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs font-display font-semibold text-muted-foreground tracking-wide uppercase">{step.label}</span>
                </motion.div>
                {i < chainSteps.length - 1 && (
                  <motion.div className="h-0.5 w-8 md:w-20 bg-hero-gradient rounded-full mt-[-24px]"
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.6 + i * 0.15 }}
                    style={{ transformOrigin: "left" }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground/50" />
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container">
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}>
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <Counter target={s.value} suffix={s.suffix} />
                <p className="text-sm text-muted-foreground mt-2 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 md:py-32 relative">
        <GridBg />
        <div className="container max-w-6xl relative">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-display font-medium text-primary tracking-widest uppercase">Features</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-3">Why <span className="text-gradient">Crypsia</span>?</h2>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative bg-card rounded-2xl p-6 border border-border/60 hover:border-primary/30 transition-colors duration-300 overflow-hidden">
                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl bg-${f.accent}/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`h-6 w-6 text-${f.accent}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="container max-w-5xl relative">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-display font-medium text-primary tracking-widest uppercase">Process</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-3">How It <span className="text-gradient">Works</span></h2>
          </motion.div>
          <div className="relative">
            <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-chain-manufacturer via-chain-distributor to-chain-customer opacity-20" />
            <motion.div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}>
              {steps.map((s, i) => (
                <motion.div key={s.title} variants={fadeUp} className="relative text-center">
                  <motion.div className="mx-auto h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 relative z-10"
                    whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <s.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-hero-gradient text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </motion.div>
                  <h3 className="font-display font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <Particles />
        <div className="container max-w-3xl relative text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="bg-card border border-border/60 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-[0.03]" />
            <div className="relative">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-flex">
                <Zap className="h-10 w-10 text-primary mb-6" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Secure Your<br /><span className="text-gradient">Supply Chain?</span></h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join hundreds of businesses already using Crypsia for transparent, blockchain-verified product traceability.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="hero" size="lg" asChild className="text-base px-10">
                    <Link to="/register">Create Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="hero-outline" size="lg" asChild className="text-base px-10">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-border/50">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-hero-gradient flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Crypsia</span>
          </div>
          <p>© 2026 Crypsia. Blockchain-powered supply chain traceability.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
