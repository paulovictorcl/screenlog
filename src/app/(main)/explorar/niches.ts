export type NicheDef = {
  id: string;
  name: string;
  genreId?: string;
  keywordId?: string;
  withoutGenreId?: string;
};

export const MOVIE_NICHES: Record<string, NicheDef[]> = {
  "Terror": [
    { id: "terror-geral", name: "Todos de Terror", genreId: "27", withoutGenreId: "35" },
    { id: "found-footage", name: "Found-Footage", genreId: "27", keywordId: "163053|342857|345179|340385" },
    { id: "slasher", name: "Slasher / Serial Killer", genreId: "27", keywordId: "12339|325981|325992" },
    { id: "zumbi", name: "Zumbis", genreId: "27", keywordId: "12377|360877|186565" }
  ],
  "Ficção Científica": [
    { id: "sci-fi-geral", name: "Todas de Ficção", genreId: "878" },
    { id: "cyberpunk", name: "Cyberpunk", genreId: "878", keywordId: "12190" },
    { id: "viagem-tempo", name: "Viagem no Tempo", genreId: "878", keywordId: "4379" }, // guessed time travel ID
    { id: "alien", name: "Alienígenas", genreId: "878", keywordId: "9951" } // guessed alien
  ],
  "Comédia": [
    { id: "comedia-geral", name: "Todas de Comédia", genreId: "35" },
    { id: "terrir", name: "Terrir (Humor + Terror)", genreId: "35,27" },
    { id: "besteirol", name: "Besteirol (Slapstick)", genreId: "35", keywordId: "9253" },
    { id: "romantica", name: "Comédia Romântica", genreId: "35,10749" }
  ],
  "Ação e Aventura": [
    { id: "acao-geral", name: "Tudo de Ação", genreId: "28" },
    { id: "super-heroi", name: "Super-Heróis", genreId: "28", keywordId: "9715" },
    { id: "artes-marciais", name: "Artes Marciais", genreId: "28", keywordId: "9799" },
    { id: "espionagem", name: "Espionagem", genreId: "28,53" }
  ]
};

// Séries possuem gêneros levemente diferentes no TMDB
// Action & Adventure = 10759, Sci-Fi & Fantasy = 10765, Comedy = 35, Mystery = 9648
export const TV_NICHES: Record<string, NicheDef[]> = {
  "Mistério e Suspense": [
    { id: "misterio-geral", name: "Suspense Geral", genreId: "9648" },
    { id: "investigacao", name: "Investigação Policial", genreId: "9648,80" },
    { id: "assombracao", name: "Assombrações", genreId: "9648", keywordId: "3386" }
  ],
  "Ficção e Fantasia": [
    { id: "sci-fi-tv", name: "Ficção e Fantasia", genreId: "10765" },
    { id: "pos-apocaliptico", name: "Pós-Apocalíptico", genreId: "10765", keywordId: "4442" },
    { id: "dragao", name: "Épico / Magia", genreId: "10765", keywordId: "207317" }
  ],
  "Comédia": [
    { id: "comedia-tv", name: "Todas de Comédia", genreId: "35" },
    { id: "sitcom", name: "Sitcoms (Risadas)", genreId: "35", keywordId: "9715" },
    { id: "humor-negro", name: "Humor Negro", genreId: "35", keywordId: "9753" }
  ],
  "Ação e Aventura": [
    { id: "acao-tv", name: "Todas de Ação", genreId: "10759" },
    { id: "super-heroi-tv", name: "Super-Heróis", genreId: "10759", keywordId: "9715" },
    { id: "anime", name: "Animes", genreId: "16", keywordId: "210024" }
  ]
};
