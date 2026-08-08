import { discoverMedia, TMDBMedia } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import ToggleSwitch from "@/components/ToggleSwitch";
import { MOVIE_NICHES, TV_NICHES } from "./niches";
import Link from "next/link";
import { Suspense } from "react";

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string; niche?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentType = (resolvedParams.type as 'movie' | 'tv') || 'movie';
  const NICHES = currentType === 'movie' ? MOVIE_NICHES : TV_NICHES;
  
  const categoryNames = Object.keys(NICHES);
  let activeCategory = resolvedParams.category;
  
  if (!activeCategory || !NICHES[activeCategory]) {
    activeCategory = categoryNames[0]; // Categoria padrão (ex: Terror)
  }

  const activeNiches = NICHES[activeCategory];
  let currentNicheId = resolvedParams.niche;
  
  let selectedNicheDef = activeNiches.find(n => n.id === currentNicheId);
  if (!selectedNicheDef) {
    selectedNicheDef = activeNiches[0];
    currentNicheId = selectedNicheDef.id;
  }

  let results: TMDBMedia[] = [];
  try {
    const data = await discoverMedia(currentType, selectedNicheDef.genreId, selectedNicheDef.keywordId, selectedNicheDef.withoutGenreId);
    results = data.results || [];
  } catch (error) {
    console.error("Erro ao buscar descoberta do TMDB:", error);
  }

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Explorar</h1>
        <p className="page-subtitle">
          Mergulhe em categorias específicas e descubra pérolas escondidas.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <Suspense fallback={null}>
          <ToggleSwitch />
        </Suspense>
      </div>

      {/* Menu de Gêneros Principais */}
      <div className="scrollable-row" style={{ gap: '1rem', marginBottom: '1rem' }}>
        {categoryNames.map(cat => (
          <Link
            key={cat}
            href={`/explorar?type=${currentType}&category=${cat}`}
            scroll={false}
            className="glass-panel"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '99px',
              textDecoration: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? '#fff' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s',
              border: `1px solid ${activeCategory === cat ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'}`
            }}
          >
            {cat}
          </Link>
        ))}
        {/* Spacer to allow scrolling past the last item elegantly */}
        <div style={{ width: '1px', flexShrink: 0 }} />
      </div>

      {/* Menu de Sub-Gêneros (Nichos) */}
      <div className="scrollable-row" style={{ gap: '0.75rem', marginBottom: '3rem' }}>
        {activeNiches.map(niche => {
          const isActive = selectedNicheDef?.id === niche.id;
          return (
            <Link 
              key={niche.id}
              href={`/explorar?type=${currentType}&category=${activeCategory}&niche=${niche.id}`}
              scroll={false}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '99px',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)'}`
              }}
            >
              {niche.name}
            </Link>
          );
        })}
        <div style={{ width: '1px', flexShrink: 0 }} />
      </div>

      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-color)' }}>🎯</span> {selectedNicheDef.name}
        </h2>
        
        {results.length > 0 ? (
          <div className="media-grid">
            {results.map((media) => (
              <MediaCard key={media.id} media={{...media, media_type: currentType}} />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px', color: 'rgba(255,255,255,0.5)' }}>
            Nenhum resultado encontrado para este nicho.
          </div>
        )}
      </section>
    </div>
  );
}
