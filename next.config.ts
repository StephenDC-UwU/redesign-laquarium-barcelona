import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  i18n:{
    locales: ['es','en'],
    defaultLocale: 'es',
  }
};

export default nextConfig;
