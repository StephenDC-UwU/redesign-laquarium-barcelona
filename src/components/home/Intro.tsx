"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Dictionary } from "@/dictionaries";
import CardIntro from "./components/CardIntro";
import BadgeIntro from "./components/BadgeIntro";

gsap.registerPlugin(ScrollTrigger);

interface IntroProps {
  dict: Dictionary;
}

export default function Intro({ dict }: IntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const intro = dict.intro;

  // Winding path SVG coordinate data
  const pathD = "M 419 -143 C -23.9658 14.0881 -7.441 289.285 6.1063 378 C 19.6535 466.715 288.611 694.556 483.107 628.5 C 803.808 605.213 856.708 822.956 753.607 1005.5 C 577.77 1204.72 84.6067 1118.5 84.6067 1304.5";



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
          end: "bottom 60%",
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

      // Animate cards and badges appearing along the path (Badges first, then Cards)
      tl.fromTo(".intro-badge-1",
        { opacity: 0, scale: 0.3, rotate: -15 },
        { opacity: 1, scale: 1, rotate: 6, ease: "back.out(0.2)", duration: 0.6 },
        0
      );

      tl.fromTo(".intro-badge-2",
        { opacity: 0, scale: 0.3, rotate: 15 },
        { opacity: 1, scale: 1, rotate: -6, ease: "elastic.out(1, 0.6)", duration: 0.6 },
        0.3
      );

      tl.fromTo(".intro-card-1",
        { opacity: 0, y: 80, scale: 0.85, rotate: -8 },
        { opacity: 1, y: 0, scale: 1, rotate: -3, ease: "back.out(1)", duration: 0.2 },
        0.3
      );

      tl.fromTo(".intro-card-2",
        { opacity: 0, y: 80, scale: 0.85, rotate: 8 },
        { opacity: 1, y: 0, scale: 1, rotate: 3, ease: "back.out(1.2)", duration: 0.6 },
        1
      );

      tl.fromTo(".intro-card-3",
        { opacity: 0, y: 80, scale: 0.85, rotate: -8 },
        { opacity: 1, y: 0, scale: 1, rotate: -2, ease: "back.out(1.2)", duration: 0.6 },
        1.5
      );
    });

    // Mobile Animation (scroll reveal elements sequentially)
    mm.add("(max-width: 767px)", () => {
      console.log("GSAP MatchMedia: Mobile");
      const items = [".intro-badge-1", ".intro-badge-2", ".intro-card-1", ".intro-card-2", ".intro-card-3"];
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
            strokeDasharray="32 32"
          />

          {/* Blue Foreground path (Travelled/Drawn Road) */}
          <path
            d={pathD}
            stroke="currentColor"
            className="text-primary"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="32 32"
            mask="url(#road-mask)"
          />
        </svg>

        {/* Card 1: Horario / Calendario (Top Left) */}
        <CardIntro
          className="intro-card-1"
          style={{ left: "-5%", top: "14%", width: "42%", height: "20%", transform: "rotate(-3deg)" }}
          text={intro.card1_text}
          buttonText={intro.card1_btn}
          buttonVariant="primary"
        />

        {/* Badge 1: Horario (Top Right) */}
        <BadgeIntro
          className="intro-badge-1"
          style={{ left: "68%", top: "8%", width: "28%", height: "18%" }}
          text={intro.badge1_text}
          variant={1}
        />

        {/* Badge 2: Entradas (Middle Left) */}
        <BadgeIntro
          className="intro-badge-2"
          style={{ left: "5%", top: "50%", width: "28%", height: "18%" }}
          text={intro.badge2_text}
          variant={2}
        />

        {/* Card 2: Compra (Middle Right) */}
        <CardIntro
          className="intro-card-2"
          style={{ left: "60%", top: "50%", width: "40%", height: "22%", transform: "rotate(3deg)" }}
          text={intro.card2_text}
          buttonText={intro.card2_btn}
          buttonVariant="tertiary"
        />

        {/* Card 3: Cómo Llegar (Bottom Left) */}
        <CardIntro
          className="intro-card-3"
          style={{ left: "5%", top: "80%", width: "42%", height: "20%", transform: "rotate(-2deg)" }}
          text={intro.card3_text}
          buttonText={intro.card3_btn}
          buttonVariant="primary"
        />

      </div>

      {/* 2. MOBILE VIEWPORT LAYOUT */}
      <div className="relative w-full max-w-md mx-auto flex flex-col gap-16 px-6 py-10 md:hidden select-none">

        {/* Vertical Dashed Road Background Line */}
        <div className="absolute left-[36px] top-6 bottom-6 border-l-4 border-dashed border-slate-200 dark:border-slate-800 -z-10 pointer-events-none" />

        {/* Mobile Item 1: Card 1 */}
        <div className="intro-card-1 pl-12 w-full">
          <CardIntro
            layout="mobile"
            text={intro.card1_text}
            buttonText={intro.card1_btn}
            buttonVariant="primary"
          />
        </div>

        {/* Mobile Item 2: Badge 1 */}
        {/*   <div className="intro-badge-1 pl-12 w-full flex justify-start">
          <BadgeIntro
            layout="mobile"
            text={intro.badge1_text}
            variant={1}
          />
        </div> */}

        {/* Mobile Item 3: Badge 2 */}
        {/*  <div className="intro-badge-2 pl-12 w-full flex justify-start">
          <BadgeIntro
            layout="mobile"
            text={intro.badge2_text}
            variant={2}
          />
        </div> */}

        {/* Mobile Item 4: Card 2 */}
        <div className="intro-card-2 pl-12 w-full">
          <CardIntro
            layout="mobile"
            text={intro.card2_text}
            buttonText={intro.card2_btn}
            buttonVariant="tertiary"
          />
        </div>

        {/* Mobile Item 5: Card 3 */}
        <div className="intro-card-3 pl-12 w-full">
          <CardIntro
            layout="mobile"
            text={intro.card3_text}
            buttonText={intro.card3_btn}
            buttonVariant="primary"
          />
        </div>

      </div>

    </section>
  );
}
