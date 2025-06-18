/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Babel for compilation
  experimental: {
    esmExternals: false,
  },
  // Disable SWC minification
  swcMinify: false,
}

module.exports = nextConfig