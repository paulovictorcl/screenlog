"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import styles from "./ToggleSwitch.module.css";

export default function ToggleSwitch({ paramName = "type" }: { paramName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentType = searchParams.get(paramName) || 'movie';

  const handleToggle = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, newType);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.toggleContainer}>
      <button 
        className={`${styles.toggleBtn} ${currentType === 'movie' ? styles.active : ''}`}
        onClick={() => handleToggle('movie')}
      >
        Filmes
      </button>
      <button 
        className={`${styles.toggleBtn} ${currentType === 'tv' ? styles.active : ''}`}
        onClick={() => handleToggle('tv')}
      >
        Séries
      </button>
    </div>
  );
}
