/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve under a sub-path (e.g. https://company.com/demos/hospital-cart) by setting
  // NEXT_PUBLIC_BASE_PATH=/demos/hospital-cart at build time. Empty = served from root/subdomain.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
export default nextConfig;
