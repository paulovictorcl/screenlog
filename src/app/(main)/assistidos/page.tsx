import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import MediaCard from "@/components/MediaCard";

export default async function AssistidosPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>Não autorizado.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  // Busca as mídias salvas como WATCHED
  const savedMedia = await prisma.mediaStatus.findMany({
    where: {
      userId: user.id,
      watched: true
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
        <h1 className="page-title">Assistidos</h1>
        <p className="page-subtitle">
          Seu histórico de filmes e séries, com suas avaliações.
        </p>
      </header>

      <section>
        {savedMedia.length > 0 ? (
          <div className="media-grid">
            {savedMedia.map(({ media, rating }) => (
              <div key={media.id} style={{ position: 'relative' }}>
                <MediaCard 
                  media={{
                    id: media.tmdbId,
                    media_type: media.type as 'movie' | 'tv',
                    title: media.title,
                    poster_path: media.posterPath,
                    overview: "", // não salvo no BD local
                    vote_average: rating || 0 // Exibe a nota do usuário no lugar da do TMDB
                  }} 
                />
                {rating && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'var(--accent-color)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 10px rgba(222,57,64,0.4)',
                    zIndex: 10
                  }}>
                    {rating} ★
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Você ainda não avaliou nenhum filme</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Clique em um filme e marque como "Já Assisti" para ele aparecer aqui!</p>
          </div>
        )}
      </section>
    </div>
  );
}
