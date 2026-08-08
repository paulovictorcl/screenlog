"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);

  // Busca automática (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query !== initialQuery) {
        if (query.trim() === '') {
          router.push('/busca');
        } else {
          router.push(`/busca?q=${encodeURIComponent(query)}`);
        }
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [query, router, initialQuery]);

  // Busca por Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (query.trim() === '') {
        router.push('/busca');
      } else {
        router.push(`/busca?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const clearSearch = () => {
    setQuery('');
    router.push('/busca');
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      alignItems: 'center',
      padding: '0.5rem 1rem', 
      borderRadius: '16px',
      gap: '1rem'
    }}>
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="rgba(255,255,255,0.5)">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Procurar filmes ou séries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: '1rem 0',
          fontSize: '1.2rem',
          color: 'var(--text-light)',
          outline: 'none'
        }}
      />
      {query && (
        <button 
          onClick={clearSearch}
          style={{ 
            color: 'rgba(255,255,255,0.4)', 
            cursor: 'pointer',
            padding: '0.5rem'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
