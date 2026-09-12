import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js blocks cross-origin requests to dev-only JS/assets by default —
  // only `localhost` is allowed out of the box. Testing on a real phone over
  // the LAN hits the dev server via its network IP instead, which was
  // silently blocking every JS chunk (hydration, event handlers, everything)
  // while HTML/CSS still rendered fine — that's why touch/:active worked but
  // no onClick/console ever fired. If your phone's IP changes, update this.
  allowedDevOrigins: ["192.168.1.5"],
};

export default nextConfig;
