/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [{ 
      source: "/api/v1/tutor/:path*", 
      destination: "https://adaptive-ai-tutor-production.up.railway.app/api/v1/tutor/:path*" 
    }];
  },
};
export default nextConfig;