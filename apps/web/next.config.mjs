/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const apiBaseUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (isProduction ? "" : "http://localhost:3001");

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
  // Proxy de API para evitar CORS desde el frontend
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
