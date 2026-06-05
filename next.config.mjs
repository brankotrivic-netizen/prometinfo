/** @type {import('next').NextConfig} */
const nextConfig = {
  // Scraperji uporabljajo Node runtime; nicesar posebnega ne rabimo zaenkrat.
  reactStrictMode: true,
  // Ta projekt je koren za file tracing (obstaja tudi lockfile v domacem imeniku).
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
