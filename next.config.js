/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" } : {}),
}

module.exports = nextConfig
