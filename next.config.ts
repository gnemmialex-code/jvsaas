import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fixe la racine du workspace sur ce projet pour éviter la détection
  // d'un lockfile parent (C:\Users\alexi\package-lock.json)
  turbopack: {
    root: path.resolve(__dirname),
  },
  devIndicators: false,
  serverExternalPackages: ["sharp"],
  // Embarque la vidéo privée Snap Rouge dans le bundle serveur (Vercel)
  outputFileTracingIncludes: {
    "/api/snap-rouge/video": ["./private-videos/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
