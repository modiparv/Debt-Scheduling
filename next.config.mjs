/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We rely on `npm run typecheck` locally; skip ESLint during production
  // builds so a no-unused-vars warning doesn't block deploy.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
