import type { NextConfig } from "next";

// Las imágenes (logo, galería) las sirve el propio API en /files.
// Se permite el host del API definido en NEXT_PUBLIC_API_BASE_URL.
function apiImagePatterns(): NonNullable<NextConfig['images']>['remotePatterns'] {
  try {
    const api = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? '');
    return [
      {
        protocol: api.protocol.replace(':', '') as 'http' | 'https',
        hostname: api.hostname,
        port: api.port,
        pathname: '/files/**',
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiImagePatterns(),
    // En local el API está en localhost (IP privada): Next lo bloquea por defecto
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
