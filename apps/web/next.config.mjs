/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const nextConfig = {
  // Raw body para webhook Stripe (solo aplica al frontend proxy; es mas relevante en API)
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.songlist.app" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  // Rewrite API calls en desarrollo
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
