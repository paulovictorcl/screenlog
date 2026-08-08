import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export default async function EstatisticasPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>Não autorizado.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return null;

  // Estatísticas Pessoais
  const watchedCount = await prisma.mediaStatus.count({ 
    where: { userId: user.id, watched: true } 
  });
  
  const inWatchlistCount = await prisma.mediaStatus.count({ 
    where: { userId: user.id, inWatchlist: true } 
  });

  const ratings = await prisma.mediaStatus.findMany({ 
    where: { userId: user.id, watched: true, rating: { not: null } },
    select: { rating: true }
  });
  
  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratings.length).toFixed(1) 
    : '0.0';

  // Competição / Comparação com o parceiro
  const allUsers = await prisma.user.findMany({ take: 2, orderBy: { createdAt: 'asc' } });
  
  const competitionStats = await Promise.all(allUsers.map(async (u) => {
    const count = await prisma.mediaStatus.count({ where: { userId: u.id, watched: true } });
    return { name: u.name, count, isMe: u.id === user.id };
  }));

  const maxMovies = Math.max(...competitionStats.map(s => s.count), 1); // evita divisão por zero

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Estatísticas</h1>
        <p className="page-subtitle">
          Seus hábitos de consumo de mídia e comparações.
        </p>
      </header>

      <div className="stats-grid-large">
        <div className="glass-panel stat-card-large" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Assistido</h3>
          <p className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-light)' }}>{watchedCount}</p>
          <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Títulos</p>
        </div>
        
        <div className="glass-panel stat-card-large" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Média de Notas</h3>
          <p className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#fbbf24' }}>{averageRating}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Estrelas</p>
        </div>

        <div className="glass-panel stat-card-large" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Na Fila</h3>
          <p className="stat-value" style={{ fontSize: '3rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--text-light)' }}>{inWatchlistCount}</p>
          <p style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }}>Títulos para ver</p>
        </div>
      </div>

      <section className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>🏆</span> Competição Cinéfila
        </h2>

        {allUsers.length < 2 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', padding: '2rem' }}>
            Convide seu parceiro para criar uma conta e veja quem assistiu mais filmes!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {competitionStats.map((stat, index) => {
              const widthPercentage = Math.max((stat.count / maxMovies) * 100, 5);
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: stat.isMe ? 'bold' : 'normal', color: stat.isMe ? 'var(--text-light)' : 'rgba(255,255,255,0.7)' }}>
                      {stat.name} {stat.isMe && '(Você)'}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{stat.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${widthPercentage}%`, 
                      height: '100%', 
                      background: stat.isMe ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      transition: 'width 1s ease-out'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
