/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for API routes
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Ensure API routes are not statically generated
  async headers() {
    return []
  },
  // Disable static optimization for API routes
  async rewrites() {
    return []
  }
}

module.exports = nextConfig 