"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
    fallbackSrc?: string;
}

export default function SafeImage({ src, fallbackSrc = "/layout/image.jpg", ...props }: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

    // Sync local state if the parent src prop updates dynamically
    useEffect(() => {
        setImgSrc(src || fallbackSrc);
    }, [src, fallbackSrc]);

    return (
        <Image
            {...props}
            src={imgSrc}
            onError={() => {
                setImgSrc(fallbackSrc);
            }}
        />
    );
}
