import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { KittenProvider, useKittenContext } from './context/KittenContext';
import { MarketplaceView } from './components/MarketplaceView';
import { AdminDashboard } from './components/AdminDashboard';

type View = 'marketplace' | 'admin';

declare global {
  interface Window {
    whiskersAdmin?: () => void;
  }
}

function AppShell() {
  const [view, setView] = useState<View>('marketplace');
  const { usingSupabase } = useKittenContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setView('admin');
    }

    try {
      const stored = window.sessionStorage.getItem('whiskers-admin-open');
      if (stored === '1') {
        setView('admin');
      }
    } catch {
      //
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setView((previous) =>
          previous === 'admin' ? 'marketplace' : 'admin',
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.whiskersAdmin = () => setView('admin');

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      delete window.whiskersAdmin;
    };
  }, []);

  useEffect(() => {
    try {
      if (view === 'admin') {
        window.sessionStorage.setItem('whiskers-admin-open', '1');
      } else {
        window.sessionStorage.removeItem('whiskers-admin-open');
      }
    } catch {
      //
    }
  }, [view]);

  const viewCopy = useMemo(
    () =>
      view === 'marketplace'
        ? 'Meet our gentle Maine Coon kittens ready for adoption.'
        : 'Private breeder tools to update kittens, images, and adoption links.',
    [view],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <div className="app-header__mark" aria-hidden="true">
              <span>🐾</span>
            </div>
            <div className="app-header__title">
              <strong>Whiskers & Co.</strong>
              <span>Maine Coon Adoption</span>
            </div>
          </div>
          <div className="app-header__details">
            <p className="app-header__tagline">
              Family-raised kittens with velvet paws and gentle hearts.
            </p>
            <div className="app-header__contact">
              <div className="app-header__contact-info">
                <span className="app-header__contact-label">Call or text</span>
                <a href="tel:2075550186">207-555-0186</a>
                <span className="app-header__hours">Daily 9am–7pm ET</span>
              </div>
              <a className="app-header__cta" href="#available-kittens">
                Plan a visit
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="app-intro">
          <p>{viewCopy}</p>
          <span className="app-intro__sync">
            {usingSupabase
              ? 'Listings refresh the moment we publish new photos.'
              : 'Demo data is shown for preview — connect Supabase to sync automatically.'}
          </span>
        </div>

        {view === 'admin' ? (
          <>
            <div className="admin-banner">
              <span>Breeder dashboard</span>
              <button
                type="button"
                onClick={() => setView('marketplace')}
                className="btn-link"
              >
                Exit to public site
              </button>
            </div>
            <AdminDashboard />
          </>
        ) : (
          <MarketplaceView />
        )}
      </main>

      <footer className="app-footer">
        <span>© {new Date().getFullYear()} Whiskers & Co. All rights reserved.</span>
        <span>Licensed TICA breeder · Tampa, Florida</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <KittenProvider>
      <AppShell />
    </KittenProvider>
  );
}
