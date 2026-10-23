"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-center py-32">
      <div className="absolute -top-40 left-1/2 h-96 w-96 rounded-full bg-fuchsia-500/40 blur-3xl" />
      <span className="inline-flex rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"><Sparkles /> AI-powered bookkeeping</span>
      <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-7xl font-bold bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent">
        Unlock your financial potential
      </motion.h1>
      <p className="mt-6 text-lg text-white/70">Seamlessly transform the way your team manages money with our all-in-one platform.</p>
      <div className="mt-10 flex justify-center gap-4">
        <a href="#" className="rounded-xl bg-white px-6 py-3 shadow-[0_0_40px_rgba(167,139,250,0.6)]">Get started →</a>
        <button onClick={() => {}} className="rounded-xl border border-white/30 px-6 py-3 backdrop-blur-md outline-none">Watch demo</button>
      </div>
      <p className="mt-8 text-white/60">Trusted by 10,000+ teams worldwide</p>
    </section>
  );
}
