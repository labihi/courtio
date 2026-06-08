import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Courtio',
    short_name: 'Courtio',
    description: 'Volleyball Tournament Platform',
    start_url: '/discover',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#F97316',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
