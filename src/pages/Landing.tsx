import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Camera, BarChart3, MessageSquare, Shield, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Camera, title: "AI Meal Scanner", desc: "Upload a photo, get instant macro breakdown with insulin spike estimation", color: "bg-pastel-yellow" },
  { icon: Brain, title: "Smart Nutrition AI", desc: "Detect food items, portion sizes, and bodybuilding suitability scores", color: "bg-pastel-pink" },
  { icon: BarChart3, title: "Progress Analytics", desc: "Track compliance, weight trends, and macro targets with beautiful dashboards", color: "bg-pastel-lavender" },
  { icon: MessageSquare, title: "Live Coaching Chat", desc: "Real-time communication between trainers and athletes", color: "bg-pastel-sky" },
  { icon: Shield, title: "Insulin Monitoring", desc: "Estimate glycemic load and blood sugar impact for every meal", color: "bg-pastel-sage" },
  { icon: Zap, title: "Diet Plan Builder", desc: "Create competition-grade meal plans with precise macro and micro targets", color: "bg-pastel-peach" },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-heading">Body Artist</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Pricing</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Login</Link>
            <Link to="/login">
              <Button className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full px-4">Login</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="rounded-full px-4">Start Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-yellow text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> AI-Powered Nutrition for Elite Athletes
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-heading leading-tight mb-6">
            Fuel Your
            <span className="relative inline-block mx-3">
              <span className="relative z-10">Gains</span>
              <motion.span
                className="absolute bottom-2 left-0 right-0 h-4 bg-pastel-pink rounded-full -z-0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </span>
            with AI Precision
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The ultimate AI nutrition coaching platform for professional bodybuilders. Scan meals, track macros, and optimize every bite for peak performance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xs sm:max-w-none mx-auto">
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 text-base h-12 sm:h-14 gap-2 w-full sm:w-auto">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="rounded-full px-8 text-base h-12 sm:h-14 w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {[
            { label: "Calories", value: "3,200", bg: "bg-pastel-yellow" },
            { label: "Protein", value: "280g", bg: "bg-pastel-pink" },
            { label: "Compliance", value: "94%", bg: "bg-pastel-sage" },
            { label: "Meal Score", value: "92", bg: "bg-pastel-sky" },
          ].map((card) => (
            <motion.div key={card.label} variants={fadeUp} className={`${card.bg} pastel-card text-center`}>
              <p className="text-3xl font-bold font-heading">{card.value}</p>
              <p className="text-sm text-foreground/70 mt-1">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold font-heading text-center mb-16"
        >
          Everything You Need to
          <br />
          <span className="text-muted-foreground">Coach at the Highest Level</span>
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`${f.color} pastel-card group hover:scale-[1.02] cursor-default`}
            >
              <div className="w-12 h-12 rounded-2xl bg-foreground/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">{f.title}</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-32">
        <div className="bg-primary text-primary-foreground rounded-3xl sm:rounded-4xl p-8 sm:p-12 md:p-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Ready to Transform Your Coaching?</h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            Join elite trainers using AI to optimize every meal for their athletes.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="rounded-full px-10 text-base h-14 gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-heading">Body Artist</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Body Artist. Built for elite performance.</p>
        </div>
      </footer>
    </div>
  );
}
