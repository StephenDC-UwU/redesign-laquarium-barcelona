"use client"

import Image from "next/image";

import bg_hero from "@/assets/home/bg-cover.jpg";
import sharkDefault from "@/assets/home/shark.svg";
import sharkActive from "@/assets/home/shark-open-mouth.svg";

import { Dictionary } from "@/dictionaries";
import { useState } from "react";


interface HeroProps {
    dict: Dictionary;
}

export default function Hero({ dict }: HeroProps) {

    const [sharkImg, setSharkImg] = useState(sharkDefault);


    return (
        <section id="hero" className="h-dvh w-full relative">
            {/* bg-gradient overlay */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.16)50%,rgba(0,0,0,0.39)92.82%,rgba(0,0,0,0.39)100%)] pointer-events-none"></div>
            <Image
                src={bg_hero}
                fill
                priority
                className="object-cover object-center -z-10 pointer-events-none"
                alt="bg_hero"
            />
            {/*Hero Title */}
            <h1 className="absolute text-fluid-title z-20 left-[70%] top-[70%] -translate-x-1/2 -translate-y-1/2 text-white font-shadows cursor-pointer select-none whitespace-nowrap"
                onMouseEnter={() => setSharkImg(sharkActive)}
                onMouseLeave={() => setSharkImg(sharkDefault)}

            >{dict.hero.hero_title}</h1>

            {/*Hero Shark */}
            <Image
                src={sharkImg}
                priority
                className="absolute z-10 left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none"
                alt="shark"
                onMouseEnter={() => setSharkImg(sharkActive)}
                onMouseLeave={() => setSharkImg(sharkDefault)}
            />

        </section>
    );
}