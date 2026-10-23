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
