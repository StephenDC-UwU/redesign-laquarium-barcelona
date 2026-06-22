"use client"

import Image from "next/image";

import bg_hero from "@/assets/home/bg-cover.jpg";
import sharkDefault from "@/assets/home/shark.svg";
import sharkActive from "@/assets/home/shark-open-mouth.svg";
import jellyfishOne from "@/assets/home/jellyfish-one.svg";
import jellyfishOneDark from "@/assets/home/jellyfish-one-dark.svg";
import jellyfishTwo from "@/assets/home/jellyfish-two.svg";
import jellyfishTwoDark from "@/assets/home/jellyfish-two-dark.svg";

import { Dictionary } from "@/dictionaries";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Theme } from "@/types/Theme";

interface HeroProps {
    dict: Dictionary;
}

export default function Hero({ dict }: HeroProps) {
    const { theme } = useTheme();
    const [sharkImg, setSharkImg] = useState(sharkDefault);

    return (
        <section id="hero" className="h-dvh w-full relative flex flex-col 2xl:block items-center justify-center gap-8 px-6 pt-20 2xl:pt-0">
            {/* bg-gradient overlay */}
            <div className={`absolute inset-0 z-0  ${theme === Theme.DARK ? 'bg-black/70' : 'bg-[linear-gradient(180deg,rgba(0,0,0,0.4)0%,rgba(0,0,0,0.6)33%,rgba(0,0,0,0.6)66%,rgba(0,0,0,0.7)100%)]'}`}></div>
            <Image
                src={bg_hero}
                fill
                priority
                className="object-cover object-center -z-10 pointer-events-none"
                alt="bg_hero"
            />

            {/*Hero Shark */}
            <Image
                src={sharkImg}
                priority
                className="relative 2xl:absolute z-10 left-auto top-auto 2xl:left-3/10 2xl:top-1/2 translate-x-0 translate-y-0 2xl:-translate-x-1/2 2xl:-translate-y-1/2 cursor-pointer select-none w-[70%] max-w-[320px] 2xl:w-auto 2xl:max-w-none h-auto transition-all duration-300"
                alt="shark"
                onMouseEnter={() => setSharkImg(sharkActive)}
                onMouseLeave={() => setSharkImg(sharkDefault)}
            />

            {/*Hero Title */}
            <h1 className="relative text-6xl lg:text-9xl z-20 left-auto top-auto 2xl:left-full 2xl:top-[78%] translate-x-0 translate-y-0 2xl:-translate-x-1/2 2xl:-translate-y-1/2 text-white font-shadows cursor-pointer select-none leading-38 hover:text-primary transition-colors duration-300 ease-in-out text-center 2xl:text-left"
                onMouseEnter={() => setSharkImg(sharkActive)}
                onMouseLeave={() => setSharkImg(sharkDefault)}

            >{dict.hero.hero_title}</h1>

            {/*Hero Jellyfish one*/}
            <div className="hidden 2xl:block absolute top-[40%] left-[70%] -translate-x-1/2 -translate-y-1/2 z-10 hover-jellyfish cursor-pointer">
                <Image
                    src={jellyfishOne}
                    className={`transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-0" : "opacity-100"
                        }`}
                    alt="jellyfish one light"
                />
                <Image
                    src={jellyfishOneDark}
                    className={`absolute top-0 left-0 transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-100" : "opacity-0"
                        }`}
                    alt="jellyfish one dark"
                />
            </div>

            {/*Hero Jellyfish two*/}
            <div className="hidden 2xl:block absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 z-10 hover-jellyfish cursor-pointer">
                <Image
                    src={jellyfishTwo}
                    className={`transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-0" : "opacity-100"
                        }`}
                    alt="jellyfish two light"
                />
                <Image
                    src={jellyfishTwoDark}
                    className={`absolute top-0 left-0 transition-opacity duration-500 ease-in-out ${theme === Theme.DARK ? "opacity-100" : "opacity-0"
                        }`}
                    alt="jellyfish two dark"
                />
            </div>

        </section>
    );
}