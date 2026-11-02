import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Staff Guru',
    short_name: 'Staff Guru',
    description: 'Find verified professionals in Nigeria. Hire in days, not weeks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#008751',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
