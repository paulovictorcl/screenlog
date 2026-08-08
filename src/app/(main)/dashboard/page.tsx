import { getServerSession } from "next-auth";
import { getTrending, getNowPlayingMovies, getUpcoming, getRecommendations, TMDBMedia } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import ToggleSwitch from "@/components/ToggleSwitch";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await getServerSession();
  
  let watchlistCount = 0;
  let watchedCount = 0;
  let favoritesCount = 0;
  let averageRating = '0.0';
  let randomFavoriteId: number | null = null;
  let randomFavoriteTitle = "";

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }});
    if (user) {
      watchlistCount = await prisma.mediaStatus.count({ where: { userId: user.id, inWatchlist: true }});
      watchedCount = await prisma.mediaStatus.count({ where: { userId: user.id, watched: true }});
      
      const ratings = await prisma.mediaStatus.findMany({
        where: { userId: user.id, watched: true, rating: { not: null } },
        include: { media: true }
      });

      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        averageRating = (sum / ratings.length).toFixed(1);
        
        const favorites = ratings.filter(r => r.rating && r.rating >= 4);
        favoritesCount = favorites.length;
        
        if (favoritesCount > 0) {
          // Pega um favorito aleatório para basear as recomendações!
          const randomFav = favorites[Math.floor(Math.random() * favoritesCount)];
          randomFavoriteId = randomFav.media.tmdbId; // Aqui pegamos o ID numérico do TMDB
          randomFavoriteTitle = randomFav.media.title;
        }
      }
    }
  }

  const resolvedParams = await searchParams;
  const currentType = (resolvedParams.type as 'movie' | 'tv') || 'movie';

  let trendingData: TMDBMedia[] = [];
  let upcomingData: TMDBMedia[] = [];
  let recommendationsData: TMDBMedia[] = [];
  let nowPlayingData: TMDBMedia[] = []; // Só para filmes
  
  try {
    const [trendingRes, upcomingRes, recRes, nowPlayingRes] = await Promise.all([
      getTrending(currentType, 'week'),
      getUpcoming(currentType),
      randomFavoriteId ? getRecommendations(randomFavoriteId, currentType) : Promise.resolve({ results: [] }),
      currentType === 'movie' ? getNowPlayingMovies() : Promise.resolve({ results: [] })
    ]);
    trendingData = trendingRes.results.slice(0, 10);
    upcomingData = upcomingRes.results.slice(0, 10);
    recommendationsData = recRes.results.slice(0, 10);
    nowPlayingData = nowPlayingRes.results?.slice(0, 10) || [];
  } catch (error) {
    console.error("Erro ao buscar dados do TMDB:", error);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Bem-vindo{session?.user?.name ? `, ${session.user.name}` : ''}.
        </p>
      </header>
      
      <div className="stats-grid">
        <div className="glass-panel stat-card-dash" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(222, 57, 64, 0.15)', padding: '1rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Assistidos</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{watchedCount}</p>
          </div>
        </div>
        
        <div className="glass-panel stat-card-dash" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1rem', borderRadius: '12px', color: '#fff' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Watchlist</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{watchlistCount}</p>
          </div>
        </div>

        <div className="glass-panel stat-card-dash" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '1rem', borderRadius: '12px', color: '#fbbf24' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Média Geral</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{averageRating}</p>
          </div>
        </div>

        <div className="glass-panel stat-card-dash" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '1rem', borderRadius: '12px', color: '#ec4899' }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Favoritos (4+)</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem' }}>{favoritesCount}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ToggleSwitch />
      </div>

      {recommendationsData.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-color)' }}>✨</span> Porque você gostou de {randomFavoriteTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Recomendações mágicas baseadas no seu bom gosto.</p>
          
          <div className="media-grid">
            {recommendationsData.map((media) => (
              <MediaCard key={media.id} media={{...media, media_type: currentType}} />
            ))}
          </div>
        </section>
      )}

      {currentType === 'movie' && nowPlayingData.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-color)' }}>🍿</span> Em Cartaz nos Cinemas
          </h2>
          
          <div className="media-grid">
            {nowPlayingData.map((media) => (
              <MediaCard key={media.id} media={{...media, media_type: 'movie'}} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>🔥</span> {currentType === 'movie' ? 'Filmes em Alta' : 'Séries em Alta'}
        </h2>
        
        {trendingData.length > 0 ? (
          <div className="media-grid">
            {trendingData.map((media) => (
              <MediaCard key={media.id} media={{...media, media_type: currentType}} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px', color: 'rgba(255,255,255,0.5)' }}>
            Não foi possível carregar as tendências.
          </div>
        )}
      </section>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>🗓️</span> {currentType === 'movie' ? 'Próximos Lançamentos' : 'Novos Episódios'}
        </h2>
        
        {upcomingData.length > 0 ? (
          <div className="media-grid">
            {upcomingData.map((media) => (
              <MediaCard key={media.id} media={{...media, media_type: currentType}} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px', color: 'rgba(255,255,255,0.5)' }}>
            Nenhum lançamento encontrado.
          </div>
        )}
      </section>

    </div>
  );
}
