import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/mockData";

const colorMap: Record<string, string> = {
  "pastel-sage": "bg-pastel-sage",
  "pastel-yellow": "bg-pastel-yellow",
  "pastel-pink": "bg-pastel-pink",
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-heading">Body Artist</span>
          </Link>
          <Link to="/signup"><Button className="rounded-full px-6">Get Started</Button></Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground">Choose the plan that fits your coaching practice</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`${colorMap[plan.color]} pastel-card relative flex flex-col ${plan.popular ? "ring-2 ring-foreground scale-105" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold font-heading">{plan.name}</h3>
              <p className="text-sm text-foreground/60 mt-1">{plan.description}</p>
              <div className="mt-6 mb-6">
                <span className="text-5xl font-bold font-heading">${plan.price}</span>
                <span className="text-foreground/60">{plan.period}</span>
              </div>
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-8">
                <Button className={`w-full rounded-full h-12 ${plan.popular ? "" : "variant-outline"}`} variant={plan.popular ? "default" : "outline"}>
                  Get Started
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
