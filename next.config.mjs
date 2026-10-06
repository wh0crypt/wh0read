/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Capacitor to generate standard HTML/JS/CSS files
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;