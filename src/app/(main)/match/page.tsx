import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import MediaCard from "@/components/MediaCard";

export default async function MatchPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>Não autorizado.</div>;
  }

  // Pega todos os usuários do sistema (limitado a 2 pela regra de negócio)
  const users = await prisma.user.findMany({
    take: 2,
    orderBy: { createdAt: 'asc' }
  });

  if (users.length < 2) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3rem', borderRadius: '24px', maxWidth: '600px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Esperando sua companhia ❤️</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            A tela de Match funciona cruzando os seus gostos com os do seu parceiro. <br/>
            Crie a conta da segunda pessoa para começar a ver os Matches Perfeitos!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>🍿</span>
            <span style={{ fontSize: '3rem' }}>💑</span>
            <span style={{ fontSize: '3rem' }}>🎬</span>
          </div>
        </div>
      </div>
    );
  }

  const [userA, userB] = users;

  // Filmes onde ambos colocaram "Quero Assistir" (Watchlist)
  const perfectMatches = await prisma.media.findMany({
    where: {
      AND: [
        { userStatuses: { some: { userId: userA.id, inWatchlist: true } } },
        { userStatuses: { some: { userId: userB.id, inWatchlist: true } } }
      ]
    }
  });

  // Filmes onde ambos Assistiram E deram nota >= 4
  const coupleFavorites = await prisma.media.findMany({
    where: {
      AND: [
        { userStatuses: { some: { userId: userA.id, watched: true, rating: { gte: 4 } } } },
        { userStatuses: { some: { userId: userB.id, watched: true, rating: { gte: 4 } } } }
      ]
    }
  });

  return (
    <div>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Match de Casal</h1>
        <p style={{ marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem' }}>
          Filmes e séries que combinam com os gostos de <strong>{userA.name}</strong> e <strong>{userB.name}</strong>.
        </p>
      </header>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>🔥</span> Matches Perfeitos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Ambos colocaram na Watchlist. Que tal assistir hoje?</p>
        
        {perfectMatches.length > 0 ? (
          <div className="media-grid">
            {perfectMatches.map((media) => (
              <MediaCard 
                key={media.id} 
                media={{
                  id: media.tmdbId,
                  media_type: media.type as 'movie' | 'tv',
                  title: media.title,
                  poster_path: media.posterPath,
                  backdrop_path: media.posterPath,
                  overview: "",
                  vote_average: 0
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
            Vocês ainda não deram nenhum Match em filmes que querem assistir.
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>❤️</span> Favoritos do Casal
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Filmes e séries que ambos assistiram e deram notas altas.</p>
        
        {coupleFavorites.length > 0 ? (
          <div className="media-grid">
            {coupleFavorites.map((media) => (
              <MediaCard 
                key={media.id} 
                media={{
                  id: media.tmdbId,
                  media_type: media.type as 'movie' | 'tv',
                  title: media.title,
                  poster_path: media.posterPath,
                  backdrop_path: media.posterPath,
                  overview: "",
                  vote_average: 0
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
            Vocês ainda não possuem filmes favoritos em comum.
          </div>
        )}
      </section>
    </div>
  );
}
