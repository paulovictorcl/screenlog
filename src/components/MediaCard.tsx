"use client";

import Image from 'next/image';
import styles from './MediaCard.module.css';
import { TMDBMedia } from '@/lib/tmdb';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface MediaCardProps {
  media: TMDBMedia;
}

export default function MediaCard({ media }: MediaCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const title = media.title || media.name || 'Desconhecido';
  const date = media.release_date || media.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/fundo-1.jpg'; // fallback image
    
  const searchParams = useSearchParams();

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('mediaId', media.id.toString());
    if (media.media_type) {
      params.set('mediaType', media.media_type);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
    
  return (
    <div className={styles.card} onClick={handleOpenModal}>
      <div className={styles.imageWrapper}>
        <Image 
          src={posterUrl} 
          alt={title} 
          fill 
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className={styles.poster}
        />
        <div className={styles.overlay}>
          <button className={styles.actionBtn}>
            <HeartIcon />
          </button>
          <button className={styles.actionBtn}>
            <EyeIcon />
          </button>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title} title={title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.year}>{year}</span>
          <span className={styles.type}>
            {media.media_type === 'tv' ? 'Série' : 'Filme'}
          </span>
          <span className={styles.rating}>⭐ {media.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function HeartIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
