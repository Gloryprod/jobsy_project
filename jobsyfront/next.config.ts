import type { NextConfig } from 'next'

// D43, facultatif : l'API servie sous le domaine du front. Avec API_ORIGIN (racine du back) et NEXT_PUBLIC_API_URL=/ ,
// le navigateur appelle /api et /storage sur le domaine du front et Next.js les relaie au back : plus de requête de
// vérification CORS, et des cookies de session propres au site. Sans API_ORIGIN, rien ne change.
const apiOrigin = process.env.API_ORIGIN?.replace(/\/+$/, '')

// Les fichiers (logos, photos...) sont servis par l'API Laravel sous /storage : on autorise son domaine
// (API_ORIGIN, sinon NEXT_PUBLIC_API_URL quand c'est une adresse complète), en plus de localhost pour le développement.
const urlPublique = process.env.NEXT_PUBLIC_API_URL ?? ''
const apiUrl = new URL(apiOrigin || (/^https?:\/\//.test(urlPublique) ? urlPublique : 'http://localhost:8000'))

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!apiOrigin) return []
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/storage/:path*', destination: `${apiOrigin}/storage/:path*` },
    ]
  },
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
