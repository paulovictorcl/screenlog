import { getServerSession } from "next-auth";
import { searchMedia, TMDBMedia } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import SearchInput from "./SearchInput"; 
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return <div>Não autorizado.</div>;
  }

  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  let results: TMDBMedia[] = [];

  if (query.trim()) {
    try {
      const data = await searchMedia(query);
      // O endpoint multi retorna pessoas (person) também, vamos filtrar só filmes e séries
      results = data.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      );
    } catch (e) {
      console.error("Erro na busca", e);
    }
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Buscar</h1>
        <p className="page-subtitle">
          Procure por seus filmes e séries favoritos.
        </p>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <Suspense fallback={<div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>Carregando busca...</div>}>
          <SearchInput />
        </Suspense>
      </section>

      {query ? (
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Resultados para <span style={{ color: 'var(--accent-color)' }}>"{query}"</span>
          </h2>
          
          {results.length > 0 ? (
            <div className="media-grid">
              {results.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
              Nenhum resultado encontrado.
            </div>
          )}
        </section>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍿</div>
          <p style={{ fontSize: '1.2rem' }}>O que vamos assistir hoje?</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Pesquise por títulos, franquias ou gêneros no campo acima.</p>
        </div>
      )}
    </div>
  );
}
