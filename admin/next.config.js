/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'raksha-farms.onrender.com' },
    ],
  },
}
module.exports = nextConfig
