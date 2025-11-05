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
  const [showDevHint, setShowDevHint] = useState<boolean>(() => import.meta.env.DEV);
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
        setShowDevHint(false);
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
        <div className="app-header__brand">
          <div className="app-header__mark" aria-hidden="true">
            <span>🐾</span>
          </div>
          <div className="app-header__title">
            <strong>Whiskers & Co.</strong>
            <span>Maine Coon Adoption</span>
          </div>
        </div>
        <div className="app-header__contact">
          <span>Call or text:</span>
          <a href="tel:2075550186">207-555-0186</a>
        </div>
      </header>

      <main>
        <div className="view-subheading">
          <p>{viewCopy}</p>
          <span className="view-subheading__sync">
            {usingSupabase
              ? 'Live updates powered by Supabase'
              : 'Demo mode – add SUPABASE_URL and SUPABASE_ANON_KEY to sync'}
          </span>
        </div>

        {import.meta.env.DEV && showDevHint ? (
          <p className="dev-hint">
            Developer hint: press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> to
            toggle breeder tools.
          </p>
        ) : null}

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
        <span>Licensed TICA breeder · Portland, Maine</span>
        {import.meta.env.DEV ? (
          <span className="app-footer__hint">
            Dev shortcut: Ctrl+Shift+A toggles the breeder dashboard.
          </span>
        ) : null}
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
