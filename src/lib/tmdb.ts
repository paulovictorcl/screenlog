const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export async function getTrending(type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY não configurada!");
    return { results: [] };
  }
  
  const res = await fetch(`${BASE_URL}/trending/${type}/${timeWindow}?api_key=${TMDB_API_KEY}&language=pt-BR`, {
    next: { revalidate: 3600 } // Cache por 1 hora
  });
  
  if (!res.ok) {
    throw new Error('Falha ao buscar tendências do TMDB');
  }
  
  return res.json();
}

export async function searchMedia(query: string) {
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
  if (!res.ok) throw new Error('Falha ao buscar mídia');
  return res.json();
}

export async function getMediaDetails(id: number, type: 'movie' | 'tv') {
  const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-BR`);
  if (!res.ok) throw new Error('Falha ao buscar detalhes da mídia');
  return res.json();
}

export async function getNowPlayingMovies() {
  const res = await fetch(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=pt-BR&page=1&region=BR`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function getUpcoming(type: 'movie' | 'tv') {
  const endpoint = type === 'movie' ? 'movie/upcoming' : 'tv/on_the_air';
  const res = await fetch(`${BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&page=1&region=BR`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function getRecommendations(id: number, type: 'movie' | 'tv') {
  const res = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}&language=pt-BR&page=1`, {
    next: { revalidate: 86400 } // Cache por 1 dia
  });
  if (!res.ok) return { results: [] };
  return res.json();
}

export async function discoverMedia(type: 'movie' | 'tv', genreId?: string, keywordId?: string, withoutGenreId?: string) {
  let baseUrl = `${BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc`;
  if (genreId) baseUrl += `&with_genres=${genreId}`;
  if (withoutGenreId) baseUrl += `&without_genres=${withoutGenreId}`;
  if (keywordId) baseUrl += `&with_keywords=${encodeURIComponent(keywordId)}`;
  
  // Busca as 5 primeiras páginas em paralelo para trazer uma lista gigante (100 itens)
  const pages = [1, 2, 3, 4, 5];
  try {
    const responses = await Promise.all(
      pages.map(page => fetch(`${baseUrl}&page=${page}`, { next: { revalidate: 3600 } }))
    );
    
    let allResults: any[] = [];
    for (const res of responses) {
      if (res.ok) {
        const data = await res.json();
        if (data.results) allResults = [...allResults, ...data.results];
      }
    }
    return { results: allResults };
  } catch (e) {
    return { results: [] };
  }
}
