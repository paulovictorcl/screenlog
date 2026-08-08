"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();

  const userImage = session?.user?.image;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/busca', label: 'Buscar', icon: <SearchIcon /> },
    { path: '/explorar', label: 'Explorar', icon: <CompassIcon /> },
    { path: '/watchlist', label: 'Watchlist', icon: <ListIcon /> },
    { path: '/assistidos', label: 'Assistidos', icon: <CheckCircleIcon /> },
    { path: '/match', label: 'Match', icon: <HeartIcon /> },
    { path: '/estatisticas', label: 'Estatísticas', icon: <BarChartIcon /> },
  ];

  const quickAccessPaths = ['/dashboard', '/busca', '/watchlist', '/assistidos', '/match'];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* HAMBURGER MENU BUTTON (MOBILE ONLY) */}
      <button 
        className={styles.hamburgerBtn}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Abrir menu"
      >
        <MenuIcon />
      </button>

      {/* OVERLAY ESCURO PARA O MENU MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR (DESKTOP) OU DRAWER (MOBILE) */}
      <aside 
        className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''} ${isMobileMenuOpen ? styles.mobileOpen : ''} glass-panel`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className={styles.logoContainer}>
          {isExpanded ? (
            <Image src="/logo.png" alt="ScreenLog" width={180} height={60} className={styles.logo} style={{ width: '100%', height: 'auto', maxWidth: '180px' }} priority unoptimized />
          ) : (
            <Image src="/simbolo.png" alt="Simbolo" width={32} height={32} className={styles.iconLogo} style={{ width: '100%', height: 'auto', maxWidth: '32px' }} priority unoptimized />
          )}
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                href={item.path} 
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className={styles.iconWrapper}>{item.icon}</div>
                {(isExpanded || isMobileMenuOpen) && <span className={styles.label}>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <Link 
            href="/perfil" 
            className={`${styles.navItem} ${pathname === '/perfil' ? styles.active : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className={styles.iconWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {userImage ? (
                <div style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-color)', position: 'relative' }}>
                  <Image src={userImage} alt="Perfil" fill style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <UserIcon />
              )}
            </div>
            {(isExpanded || isMobileMenuOpen) && <span className={styles.label}>Perfil</span>}
          </Link>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: '/login' })}>
            <div className={styles.iconWrapper}><LogOutIcon /></div>
            {(isExpanded || isMobileMenuOpen) && <span className={styles.label}>Sair</span>}
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV (QUICK ACCESS FOR MOBILE) */}
      <nav className={`${styles.bottomNav} glass-panel`}>
        {menuItems
          .filter(item => quickAccessPaths.includes(item.path))
          .map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                href={item.path} 
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconWrapper}>{item.icon}</div>
              </Link>
            );
          })}
      </nav>
    </>
  );
}

// Icons (Heroicons solid & outline mix)
function HomeIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5L12 14.5l-4.5-4.5m13.5 1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
