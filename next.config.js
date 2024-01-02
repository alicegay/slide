/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/search',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/edit/:hash',
        destination: '/upload',
      },
    ]
  },
}

module.exports = nextConfig
