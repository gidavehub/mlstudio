/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['convex'],
  },
  images: {
    domains: ['images.clerk.dev'],
  },
}

module.exports = nextConfig
