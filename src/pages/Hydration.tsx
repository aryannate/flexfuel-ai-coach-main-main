import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Hydration() {
  const [glasses, setGlasses] = useState(5);
  const target = 10;
  const pct = Math.min((glasses / target) * 100, 100);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-8 text-center pt-8">
        <h1 className="text-3xl font-bold font-heading">Hydration Tracker</h1>

        <div className="bg-pastel-sky pastel-card py-12">
          <div className="w-32 h-32 rounded-full border-4 border-foreground/15 mx-auto flex items-center justify-center relative overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-foreground/10"
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
            <div className="relative z-10">
              <Droplets className="w-8 h-8 mx-auto mb-1" />
              <span className="text-2xl font-bold font-heading">{glasses}</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-foreground/60">{glasses} / {target} glasses today</p>
          <p className="text-xs text-foreground/40 mt-1">{(glasses * 250)} ml consumed</p>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={() => setGlasses(Math.max(0, glasses - 1))} variant="outline" size="lg" className="rounded-full w-14 h-14">
            <Minus className="w-5 h-5" />
          </Button>
          <Button onClick={() => setGlasses(glasses + 1)} size="lg" className="rounded-full w-14 h-14">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-card rounded-3xl p-6 border border-border text-left">
          <h3 className="font-bold font-heading mb-3">Hydration Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>💧 Drink 500ml upon waking</li>
            <li>💧 Sip water between sets during training</li>
            <li>💧 Add electrolytes during prep for better retention</li>
            <li>💧 Target 3-4L daily for a 215lb athlete</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
