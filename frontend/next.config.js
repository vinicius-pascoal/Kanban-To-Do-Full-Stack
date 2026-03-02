/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Reduz o tamanho das Serverless Functions excluindo do bundle
  // pacotes grandes que já são carregados dinamicamente no cliente
  serverExternalPackages: ['jspdf', 'jspdf-autotable'],

  // Compressão das respostas (Vercel aplica no edge, mas bom ter)
  compress: true,
};

module.exports = nextConfig;
