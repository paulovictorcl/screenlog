import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ScreenLog',
    short_name: 'ScreenLog',
    description: 'Acompanhe e compare seus filmes e séries favoritos.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#121316',
    theme_color: '#de3940',
    icons: [
      {
        src: '/app-icon.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/app-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
  };
}
