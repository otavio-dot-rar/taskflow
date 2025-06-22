import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configurações para melhorar performance de desenvolvimento
  onDemandEntries: {
    // Manter páginas compiladas em memória por mais tempo
    maxInactiveAge: 15 * 60 * 1000, // 15 minutos
    pagesBufferLength: 4,
  },

  // Configurações experimentais para Next.js 15
  experimental: {
    // Cache de HMR para Server Components
    serverComponentsHmrCache: true,
    // Desabilitar PPR que pode causar recompilações
    ppr: false,
    // Garantir que TypeScript paths sejam respeitados
    typedRoutes: false,
  },

  // Configurações específicas para desenvolvimento
  ...(process.env.NODE_ENV === "development" && {
    // Desabilitar strict mode que pode causar double rendering
    reactStrictMode: false,
  }),

  // Configurações de produção
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
    distDir: "../dist/frontend",
    trailingSlash: true,
  }),

  images: {
    unoptimized: true,
  },

  // Configuração para garantir que webpack reconheça os aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
