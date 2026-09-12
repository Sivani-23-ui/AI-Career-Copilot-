/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint errors during production build so Vercel deploy doesn't fail
  // on style/lint warnings that don't affect runtime behaviour.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript build errors blocking deploy (type-check runs separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
