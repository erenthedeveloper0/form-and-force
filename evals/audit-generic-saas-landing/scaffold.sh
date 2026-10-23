#!/bin/bash
# SPDX-License-Identifier: MIT
# Recreates the fixture project in the empty eval workspace.
set -euo pipefail
mkdir -p "."
cat > "components.json" <<'FF_EOF'
{ "style": "default", "tailwind": { "css": "src/app/globals.css" } }
FF_EOF
mkdir -p "."
cat > "package.json" <<'FF_EOF'
{
  "name": "tidyledger-site",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "lint": "next lint" },
  "dependencies": { "next": "15.1.0", "react": "19.0.0", "react-dom": "19.0.0", "framer-motion": "11.15.0", "lucide-react": "0.468.0", "gsap": "3.12.5" },
  "devDependencies": { "typescript": "5.7.2", "tailwindcss": "3.4.17", "@types/react": "19.0.1" }
}
FF_EOF
mkdir -p "src/app"
cat > "src/app/globals.css" <<'FF_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
:root { --primary: 222.2 47.4% 11.2%; --radius: 0.5rem; }
.hero-bg { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #312e81 100%); }
.card { transition: all 0.3s ease; }
button:focus { outline: none; }
FF_EOF
mkdir -p "src/app"
cat > "src/app/layout.tsx" <<'FF_EOF'
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></head><body className={inter.className}>{children}</body></html>);
}
FF_EOF
mkdir -p "src/app"
cat > "src/app/page.tsx" <<'FF_EOF'
import Hero from "../components/Hero";
import Features from "../components/Features";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
export default function Page() {
  return (<main><Hero /><Features /><Testimonials /><Pricing /><FAQ /><CTA /></main>);
}
FF_EOF
mkdir -p "src/components"
cat > "src/components/CTA.tsx" <<'FF_EOF'
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.from(ref.current, { opacity: 0, y: 60, scrollTrigger: { trigger: ref.current } });
    window.addEventListener("scroll", () => {});
  }, []);
  return (<div ref={ref} className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-16 text-center"><h2>Ready to elevate your finances?</h2><a href="#">Start free trial</a></div>);
}
FF_EOF
mkdir -p "src/components"
cat > "src/components/FAQ.tsx" <<'FF_EOF'
export default function FAQ() { return (<section className="p-16"><h2>FAQ</h2><p>Lorem ipsum dolor sit amet.</p></section>); }
FF_EOF
mkdir -p "src/components"
cat > "src/components/Features.tsx" <<'FF_EOF'
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
FF_EOF
mkdir -p "src/components"
cat > "src/components/Hero.tsx" <<'FF_EOF'
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
FF_EOF
mkdir -p "src/components"
cat > "src/components/Pricing.tsx" <<'FF_EOF'
export default function Pricing() {
  return (<section className="grid grid-cols-3 gap-6 p-16"><div className="rounded-2xl border p-8">Starter</div><div className="rounded-2xl border p-8">Pro</div><div className="rounded-2xl border p-8" onClick={() => console.log("contact")}>Enterprise</div></section>);
}
FF_EOF
mkdir -p "src/components"
cat > "src/components/Testimonials.tsx" <<'FF_EOF'
export default function Testimonials() {
  const items = [{ quote: "TidyLedger revolutionized our workflow!", name: "Jane Doe", role: "CFO, Acme Inc", avatar: "https://i.pravatar.cc/100?img=3" }];
  return (<section className="p-16">{items.map((t) => (<figure key={t.name} className="rounded-2xl p-8"><img src={t.avatar} className="rounded-full" /><blockquote>{t.quote}</blockquote><figcaption>{t.name}, {t.role} ★★★★★</figcaption></figure>))}</section>);
}
FF_EOF
