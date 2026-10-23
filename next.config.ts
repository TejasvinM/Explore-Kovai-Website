import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos come from the API as full URLs; plain <img> tags keep them simple and lazy-loaded.
  poweredByHeader: false,
  agentRules: false,
  // This folder is the project root, even if another lockfile sits in a parent folder.
  turbopack: { root: process.cwd() },
  // The old static site's addresses (still in Google and in shared links) move permanently to the
  // new pages. Browsers keep any #part, so places.html#valparai still opens Valparai on the map.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/places.html", destination: "/places", permanent: true },
      { source: "/food.html", destination: "/food", permanent: true },
      { source: "/adventures.html", destination: "/adventures", permanent: true },
    ];
  },
};

export default nextConfig;
