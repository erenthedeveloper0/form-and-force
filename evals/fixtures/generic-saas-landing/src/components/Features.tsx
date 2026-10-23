"use client";
import { motion } from "framer-motion";
import { Zap, Rocket, Shield } from "lucide-react";
const features = [
  { icon: Zap, title: "Lightning-fast sync", body: "Cutting-edge technology that keeps everything in sync." },
  { icon: Rocket, title: "Supercharge growth", body: "Take your finances to the next level." },
  { icon: Shield, title: "Enterprise security", body: "World-class protection for your data." },
];
export default function Features() {
  return (
    <section className="grid grid-cols-3 gap-6 p-16">
      {features.map((f) => (
        <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} className="card rounded-2xl border bg-white/5 p-8 backdrop-blur">
          <f.icon /> <p className="text-xs uppercase tracking-widest text-violet-300">Feature</p>
          <h3 className="text-xl font-semibold">{f.title}</h3><p>{f.body}</p>
        </motion.div>
      ))}
    </section>
  );
}
