/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['convex'],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
  typescript: {
    // Skip type checking during build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
