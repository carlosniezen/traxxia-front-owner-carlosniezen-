/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Server Actions are enabled by default in Next 15; keep body limit generous
    // for future JSON payloads (diagnostics answers, etc).
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
