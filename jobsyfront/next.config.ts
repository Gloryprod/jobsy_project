import type { NextConfig } from 'next'

// Les fichiers (logos, photos...) sont servis par l'API Laravel sous /storage : on autorise son domaine,
// lu depuis NEXT_PUBLIC_API_URL (racine du back), en plus de localhost pour le développement.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Les console.log de debug (utilisateur connecté, listes de candidats...) ne partent pas en production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // En-têtes de sécurité de base. Une Content-Security-Policy complète reste à définir
  // (domaines du widget KkiaPay, iframes PDF servies par l'API).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Interdit d'afficher Jobsy dans une iframe d'un autre site (clickjacking sur les écrans admin, retraits...)
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol === 'https:' ? 'https' : 'http',
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**', // Adjust pathname to match your image file structure
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },
}

export default nextConfig
