import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import MediaCard from "@/components/MediaCard";

export default async function WatchlistPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>Não autorizado.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  // Busca as mídias salvas como WATCHLIST
  const savedMedia = await prisma.mediaStatus.findMany({
    where: {
      userId: user.id,
      inWatchlist: true
    },
    include: {
      media: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Minha Watchlist</h1>
        <p className="page-subtitle">
          Filmes e séries que você separou para assistir.
        </p>
      </header>

      <section>
        {savedMedia.length > 0 ? (
          <div className="media-grid">
            {savedMedia.map(({ media }) => (
              <MediaCard 
                key={media.id} 
                media={{
                  id: media.tmdbId,
                  media_type: media.type as 'movie' | 'tv',
                  title: media.title,
                  poster_path: media.posterPath,
                  backdrop_path: media.posterPath,
                  overview: "", // não salvo no BD local
                  vote_average: 0
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Sua lista está vazia</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Navegue pelo Dashboard e adicione os filmes que deseja assistir!</p>
          </div>
        )}
      </section>
    </div>
  );
}
