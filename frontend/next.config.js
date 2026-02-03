/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  // Adiciona revalidação de ISR para rotas dinâmicas
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Melhor suporte a monorepo
  experimental: {
    esmExternals: true,
  },
};

module.exports = nextConfig;
