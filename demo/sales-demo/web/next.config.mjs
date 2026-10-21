/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/sales-demo',
  images: { unoptimized: true },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
