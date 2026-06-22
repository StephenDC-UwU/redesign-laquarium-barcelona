"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Dictionary } from "@/dictionaries";

gsap.registerPlugin(ScrollTrigger);

interface IntroProps {
  dict: Dictionary;
}

export default function Intro({ dict }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const intro = dict.intro;

  // Winding path SVG coordinate data
  const pathD = "M 450 0 C 450 80, 250 100, 250 200 C 250 300, 500 250, 750 250 C 750 350, 450 450, 250 480 C 250 510, 500 500, 750 550 C 750 650, 450 780, 250 850 C 250 920, 500 980, 750 1200";

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Desktop Animation
    mm.add("(min-width: 768px)", () => {

      const path = pathRef.current;
      if (!path) {
        console.error("Path ref not found!");
        return;
      }

      const length = path.getTotalLength();


      // Set initial state of path to hidden
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      // Create timeline controlled by ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1.5,
          invalidateOnRefresh: true,
          // markers: true, // Uncomment to visually inspect trigger lines in browser
        }
      });

      // Animate the path mask drawing itself
      tl.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        duration: 3,
      });

      // Animate cards and badges appearing along the path
      tl.fromTo(".intro-card-1",
        { opacity: 0, y: 80, scale: 0.85, rotate: -8 },
        { opacity: 1, y: 0, scale: 1, rotate: -3, ease: "back.out(1.2)", duration: 0.6 },
        0.3
      );

      tl.fromTo(".intro-badge-1",
        { opacity: 0, scale: 0.3, rotate: -15 },
        { opacity: 1, scale: 1, rotate: 6, ease: "elastic.out(1, 0.6)", duration: 0.6 },
        0.8
      );

      tl.fromTo(".intro-badge-2",
        { opacity: 0, scale: 0.3, rotate: 15 },
        { opacity: 1, scale: 1, rotate: -6, ease: "elastic.out(1, 0.6)", duration: 0.6 },
        1.4
      );

      tl.fromTo(".intro-card-2",
        { opacity: 0, y: 80, scale: 0.85, rotate: 8 },
        { opacity: 1, y: 0, scale: 1, rotate: 3, ease: "back.out(1.2)", duration: 0.6 },
        1.9
      );

      tl.fromTo(".intro-card-3",
        { opacity: 0, y: 80, scale: 0.85, rotate: -8 },
        { opacity: 1, y: 0, scale: 1, rotate: -2, ease: "back.out(1.2)", duration: 0.6 },
        2.5
      );
    });

    // Mobile Animation (scroll reveal elements sequentially)
    mm.add("(max-width: 767px)", () => {
      console.log("GSAP MatchMedia: Mobile");
      const items = [".intro-card-1", ".intro-badge-1", ".intro-badge-2", ".intro-card-2", ".intro-card-3"];
      items.forEach((selector) => {
        gsap.fromTo(selector,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            scrollTrigger: {
              trigger: selector,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="w-full relative py-20 overflow-hidden ">

      {/* 1. DESKTOP VIEWPORT LAYOUT */}
      <div className="relative w-full max-w-3/4 mx-auto aspect-1000/1250 hidden md:block select-none">

        {/* SVG Dashed Road Path */}
        <svg
          className="w-full h-full absolute inset-0 z-0 pointer-events-none"
          viewBox="0 0 1000 1250"
          fill="none"
        >
          <defs>
            {/* The mask containing a solid path that GSAP draws */}
            <mask id="road-mask">
              <path
                ref={pathRef}
                d={pathD}
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
            </mask>
          </defs>

          {/* Gray Background path (Untravelled Road) */}
          <path
            d={pathD}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="16 16"
          />

          {/* Blue Foreground path (Travelled/Drawn Road) */}
          <path
            d={pathD}
            stroke="currentColor"
            className="text-primary"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="16 16"
            mask="url(#road-mask)"
          />
        </svg>

        {/* Card 1: Horario / Calendario (Top Left) */}
        <div
          style={{ left: "5%", top: "14%", transform: "rotate(-3deg)" }}
          className="intro-card-1 absolute w-[350px] bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between h-[200px] hover:scale-[1.03] transition-transform duration-300 z-10"
        >
          <p className="text-xl font-medium font-switzer leading-relaxed">
            {intro.card1_text}
          </p>
          <button className="bg-primary hover:bg-primary-light text-secondary font-bold px-6 py-2.5 rounded-xl transition-all duration-200 self-end shadow-md shadow-primary/20 cursor-pointer">
            {intro.card1_btn}
          </button>
        </div>

        {/* Badge 1: Horario (Top Right) */}
        <div
          style={{ left: "68%", top: "8%" }}
          className="intro-badge-1 absolute w-48 h-48 bg-primary rounded-[55%_45%_65%_35%_/_45%_55%_35%_65%] shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer z-10"
        >
          <span className="text-4xl text-white font-shadows font-semibold rotate-6">
            {intro.badge1_text}
          </span>
        </div>

        {/* Badge 2: Entradas (Middle Left) */}
        <div
          style={{ left: "8%", top: "40%" }}
          className="intro-badge-2 absolute w-48 h-48 bg-primary rounded-[45%_55%_35%_65%_/_55%_45%_65%_35%] shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer z-10"
        >
          <span className="text-4xl text-white font-shadows font-semibold -rotate-6">
            {intro.badge2_text}
          </span>
        </div>

        {/* Card 2: Compra (Middle Right) */}
        <div
          style={{ left: "60%", top: "46%", transform: "rotate(3deg)" }}
          className="intro-card-2 absolute w-[350px] bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between h-[200px] hover:scale-[1.03] transition-transform duration-300 z-10"
        >
          <p className="text-xl font-medium font-switzer leading-relaxed">
            {intro.card2_text}
          </p>
          <button className="bg-tertiary hover:opacity-90 text-white font-bold px-6 py-2.5 rounded-xl transition-all duration-200 self-end shadow-md shadow-tertiary/20 cursor-pointer">
            {intro.card2_btn}
          </button>
        </div>

        {/* Card 3: Cómo Llegar (Bottom Left) */}
        <div
          style={{ left: "10%", top: "76%", transform: "rotate(-2deg)" }}
          className="intro-card-3 absolute w-[350px] bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between h-[200px] hover:scale-[1.03] transition-transform duration-300 z-10"
        >
          <p className="text-xl font-medium font-switzer leading-relaxed">
            {intro.card3_text}
          </p>
          <button className="bg-primary hover:bg-primary-light text-secondary font-bold px-6 py-2.5 rounded-xl transition-all duration-200 self-end shadow-md shadow-primary/20 cursor-pointer">
            {intro.card3_btn}
          </button>
        </div>

      </div>

      {/* 2. MOBILE VIEWPORT LAYOUT */}
      <div className="relative w-full max-w-md mx-auto flex flex-col gap-16 px-6 py-10 md:hidden select-none">

        {/* Vertical Dashed Road Background Line */}
        <div className="absolute left-[36px] top-6 bottom-6 border-l-4 border-dashed border-slate-200 dark:border-slate-800 -z-10 pointer-events-none" />

        {/* Mobile Item 1: Card 1 */}
        <div className="intro-card-1 pl-12 w-full">
          <div className="bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-4">
            <p className="text-lg font-medium font-switzer leading-relaxed">
              {intro.card1_text}
            </p>
            <button className="bg-primary hover:bg-primary-light text-secondary font-bold px-5 py-2 rounded-lg transition-all duration-200 self-end shadow-md">
              {intro.card1_btn}
            </button>
          </div>
        </div>

        {/* Mobile Item 2: Badge 1 */}
        <div className="intro-badge-1 pl-12 w-full flex justify-start">
          <div className="w-36 h-36 bg-primary rounded-[55%_45%_65%_35%_/_45%_55%_35%_65%] shadow-lg shadow-primary/20 flex items-center justify-center">
            <span className="text-2xl text-white font-shadows font-semibold rotate-6">
              {intro.badge1_text}
            </span>
          </div>
        </div>

        {/* Mobile Item 3: Badge 2 */}
        <div className="intro-badge-2 pl-12 w-full flex justify-start">
          <div className="w-36 h-36 bg-primary rounded-[45%_55%_35%_65%_/_55%_45%_65%_35%] shadow-lg shadow-primary/20 flex items-center justify-center">
            <span className="text-2xl text-white font-shadows font-semibold -rotate-6">
              {intro.badge2_text}
            </span>
          </div>
        </div>

        {/* Mobile Item 4: Card 2 */}
        <div className="intro-card-2 pl-12 w-full">
          <div className="bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-4">
            <p className="text-lg font-medium font-switzer leading-relaxed">
              {intro.card2_text}
            </p>
            <button className="bg-tertiary hover:opacity-90 text-white font-bold px-5 py-2 rounded-lg transition-all duration-200 self-end shadow-md">
              {intro.card2_btn}
            </button>
          </div>
        </div>

        {/* Mobile Item 5: Card 3 */}
        <div className="intro-card-3 pl-12 w-full">
          <div className="bg-secondary text-white dark:bg-slate-900 border border-white/10 rounded-[1.5rem] p-6 shadow-xl flex flex-col gap-4">
            <p className="text-lg font-medium font-switzer leading-relaxed">
              {intro.card3_text}
            </p>
            <button className="bg-primary hover:bg-primary-light text-secondary font-bold px-5 py-2 rounded-lg transition-all duration-200 self-end shadow-md">
              {intro.card3_btn}
            </button>
          </div>
        </div>

      </div>

    </section>
  );
}
