/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rkxhyodloxgcjfuxrmwg.supabase.co',
      },
    ],
  },
};

export default nextConfig;
