import type { NextConfig } from "next";
import { buildRedirects } from "./src/config/redirects";

const nextConfig: NextConfig = {
  serverExternalPackages: ["next-auth"],
  redirects: async () => buildRedirects(),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
