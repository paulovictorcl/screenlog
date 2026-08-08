"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./GlobalModal.module.css";
import { saveMediaStatus } from "@/app/actions/media";

export default function GlobalModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const mediaId = searchParams.get("mediaId");
  const mediaType = searchParams.get("mediaType");

  const [mediaDetails, setMediaDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (mediaId && mediaType) {
      setLoading(true);
      setMediaDetails(null);
      setShowReviewForm(false);
      setRating(0);
      setReview("");
      
      // Busca detalhes diretamente da API do TMDB pelo Client (ou poderiamos fazer uma rota interna)
      fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=e1b00c94ace58cf5ac807d8f5139253c&language=pt-BR&append_to_response=translations`)
        .then(res => res.json())
        .then(data => {
          if (!data.overview && data.translations && data.translations.translations) {
            const enTranslation = data.translations.translations.find((t: any) => t.iso_639_1 === 'en');
            if (enTranslation && enTranslation.data && enTranslation.data.overview) {
              data.overview = enTranslation.data.overview;
            }
          }
          setMediaDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [mediaId, mediaType]);

  if (!mediaId || !mediaType) return null;

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mediaId');
    params.delete('mediaType');
    
    if (Array.from(params.keys()).length > 0) {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  };

  const handleSaveToWatchlist = async () => {
    if (!mediaDetails) return;
    setSaving(true);
    const title = mediaDetails.title || mediaDetails.name;
    await saveMediaStatus(
      mediaDetails.id, 
      mediaType as string, 
      title, 
      mediaDetails.poster_path, 
      "WATCHLIST"
    );
    setSaving(false);
    closeModal();
  };

  const handleSaveWatched = async () => {
    if (!mediaDetails) return;
    if (rating === 0) {
      alert("Por favor, dê uma nota de 1 a 5 estrelas!");
      return;
    }
    setSaving(true);
    const title = mediaDetails.title || mediaDetails.name;
    await saveMediaStatus(
      mediaDetails.id, 
      mediaType as string, 
      title, 
      mediaDetails.poster_path, 
      "WATCHED",
      rating,
      review
    );
    setSaving(false);
    closeModal();
  };

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={`${styles.modal} glass-panel`} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeModal}>✕</button>
        
        {loading || !mediaDetails ? (
          <div className={styles.loading}>Carregando...</div>
        ) : (
          <div className={styles.content}>
            <div className={styles.posterContainer}>
              <Image 
                src={mediaDetails.poster_path ? `https://image.tmdb.org/t/p/w500${mediaDetails.poster_path}` : '/fundo-1.jpg'}
                alt="Poster"
                fill
                className={styles.poster}
              />
            </div>
            
            <div className={styles.details}>
              <h2 className={styles.title}>{mediaDetails.title || mediaDetails.name}</h2>
              <div className={styles.meta}>
                <span className={styles.rating}>⭐ {mediaDetails.vote_average?.toFixed(1)}</span>
                <span>•</span>
                <span>{(mediaDetails.release_date || mediaDetails.first_air_date)?.substring(0, 4)}</span>
                <span>•</span>
                <span>{mediaType === 'tv' ? 'Série' : 'Filme'}</span>
              </div>
              
              <p className={styles.overview}>
                {mediaDetails.overview || "Nenhuma sinopse disponível."}
              </p>

              {!showReviewForm ? (
                <div className={styles.actions}>
                  <button 
                    className={`btn-primary ${styles.actionBtn}`} 
                    onClick={handleSaveToWatchlist}
                    disabled={saving}
                  >
                    <ListIcon /> Quero Assistir
                  </button>
                  <button 
                    className={`btn-secondary ${styles.actionBtn}`}
                    onClick={() => setShowReviewForm(true)}
                  >
                    <CheckIcon /> Já Assisti
                  </button>
                </div>
              ) : (
                <div className={styles.reviewForm}>
                  <h3>Como foi a experiência?</h3>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        className={`${styles.starBtn} ${rating >= star ? styles.starActive : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className={styles.textarea} 
                    placeholder="Escreva uma resenha curta (opcional)..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    maxLength={300}
                  />
                  <div className={styles.actions}>
                    <button className="btn-primary" onClick={handleSaveWatched} disabled={saving}>
                      {saving ? "Salvando..." : "Salvar Avaliação"}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowReviewForm(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
