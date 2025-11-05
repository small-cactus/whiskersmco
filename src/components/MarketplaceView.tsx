import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { KittenCard } from './KittenCard';
import kittensInBasket from '../assets/kittens_in_basket.png';
import { KittenDetailSheet } from './KittenDetailSheet';
import { useKittenContext } from '../context/KittenContext';
import type { CheckoutActionType, Kitten } from '../types';

const copyForStatus = {
  available: 'Ready for homes after their final vet appointments.',
  reserved:
    'Families have placed a deposit. Ask to join the backup list in case plans change.',
  sold: 'These kittens are already with their families. See what to expect from future litters.',
};

export function MarketplaceView() {
  const {
    kittens,
    addBid,
    loading,
    error: contextError,
    usingSupabase,
    refresh,
  } = useKittenContext();
  const [selected, setSelected] = useState<Kitten | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const featured = useMemo(
    () =>
      kittens.filter((kitten) => kitten.status === 'available' && kitten.featured),
    [kittens],
  );

  const available = useMemo(
    () =>
      kittens.filter((kitten) => kitten.status === 'available' && !kitten.featured),
    [kittens],
  );

  const reserved = useMemo(
    () => kittens.filter((kitten) => kitten.status === 'reserved'),
    [kittens],
  );

  const sold = useMemo(
    () => kittens.filter((kitten) => kitten.status === 'sold'),
    [kittens],
  );

  const firstKitten = useMemo(() => {
    if (featured[0]) return featured[0];
    if (available[0]) return available[0];
    if (reserved[0]) return reserved[0];
    if (sold[0]) return sold[0];
    return null;
  }, [featured, available, reserved, sold]);

  const firstKittenId = firstKitten?.id ?? null;

  const handleAddBid = (
    kittenId: string,
    payload: { bidderName: string; amount: number; message?: string },
  ) => {
    return addBid(kittenId, payload);
  };

  useEffect(() => {
    if (!feedback) return;
    const timeout = window.setTimeout(() => setFeedback(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleCheckout = (kitten: Kitten, action: CheckoutActionType) => {
    const checkoutUrl =
      action === 'deposit'
        ? kitten.depositCheckoutUrl
        : kitten.buyNowCheckoutUrl;

    if (!checkoutUrl || !checkoutUrl.startsWith('http')) {
      setFeedback(
        'Add a valid Stripe Payment Link in the admin dashboard before accepting payments.',
      );
      return;
    }

    setFeedback('Opening secure Stripe checkout in a new tab…');

    try {
      const newWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        window.location.href = checkoutUrl;
      }
    } catch {
      window.location.href = checkoutUrl;
    }
  };

  const syncMessage = usingSupabase
    ? 'Listings update instantly when we refresh the breeder dashboard.'
    : 'Demo data is showing for now — connect your Supabase project to sync automatically.';

  const scrollToFirstKitten = useCallback(() => {
    if (!firstKittenId) return;
    const target = document.querySelector<HTMLElement>('[data-first-kitten="true"]');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [firstKittenId]);

  return (
    <div className="marketplace" id="available-kittens">
      <div className="marketplace__hero-figure" aria-hidden="true">
        <img className="marketplace__hero-image" src={kittensInBasket} alt="" />
      </div>
      <header className="marketplace__hero">
        <div className="marketplace__hero-content">
          <span className="marketplace__eyebrow">Raised and cared for everyday</span>
          <div className="marketplace__hero-title">
            <h1>Snuggle-ready Maine Coons searching for their forever families.</h1>
          </div>
          <p>
            Each kitten grows up in our sunny nursery with children, soft blankets, and
            daily cuddles. We guide you through every milestone so homecoming is joyful
            for both kitten and family.
          </p>
          <div className="marketplace__hero-actions">
            <a className="marketplace__hero-link" href="tel:2075550186">
              Call us to chat
            </a>
            <button
              type="button"
              className="btn-primary"
              onClick={scrollToFirstKitten}
            >
              Meet the kittens
            </button>
          </div>
        </div>
        <div className="marketplace__hero-illustration" aria-hidden="true">
          <div className="marketplace__hero-paw" />
          <div className="marketplace__hero-sparkle marketplace__hero-sparkle--one" />
          <div className="marketplace__hero-sparkle marketplace__hero-sparkle--two" />
        </div>
      </header>

      {showInfo ? (
        <div className="marketplace__notice">
          <p>{syncMessage}</p>
          <button type="button" onClick={() => setShowInfo(false)}>
            Got it
          </button>
        </div>
      ) : null}

      {contextError ? (
        <div className="marketplace__feedback error">
          {contextError}{' '}
          <button type="button" onClick={() => refresh()}>
            Retry
          </button>
        </div>
      ) : null}

      {feedback ? <p className="marketplace__feedback">{feedback}</p> : null}

      {loading ? (
        <div className="marketplace__loading">Loading kittens…</div>
      ) : null}

      <section className="marketplace__section marketplace__section--available" data-simple>
        <div className="marketplace__section-head">
          <h2>Available now</h2>
          <p>{copyForStatus.available}</p>
        </div>
        <div className="kitten-list">
          {[...featured, ...available].map((kitten) => (
            <KittenCard
              key={kitten.id}
              kitten={kitten}
              onViewDetails={setSelected}
              onCheckout={handleCheckout}
              isHeroAnchor={kitten.id === firstKittenId}
            />
          ))}
          {!loading && featured.length + available.length === 0 ? (
            <div className="kitten-placeholder">
              <p>
                All kittens are currently reserved. Leave a bid or message and we will
                contact you when a match opens.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {reserved.length > 0 ? (
        <section className="marketplace__section marketplace__section--reserved">
          <div className="marketplace__section-head">
            <h2>Reserved</h2>
            <p>{copyForStatus.reserved}</p>
          </div>
          <div className="kitten-list">
            {reserved.map((kitten) => (
              <KittenCard
                key={kitten.id}
                kitten={kitten}
                onViewDetails={setSelected}
                onCheckout={handleCheckout}
                isHeroAnchor={kitten.id === firstKittenId}
              />
            ))}
          </div>
        </section>
      ) : null}

      {sold.length > 0 ? (
        <section className="marketplace__section marketplace__section--adopted">
          <div className="marketplace__section-head">
            <h2>Recently adopted</h2>
            <p>{copyForStatus.sold}</p>
          </div>
          <div className="kitten-list">
            {sold.map((kitten) => (
              <KittenCard
                key={kitten.id}
                kitten={kitten}
                onViewDetails={setSelected}
                onCheckout={handleCheckout}
                isHeroAnchor={kitten.id === firstKittenId}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="marketplace__journey">
        <div className="marketplace__journey-head">
          <h2>Your adoption journey</h2>
          <p>Warm hearts, gentle paws, and guidance from the first hello to homecoming.</p>
        </div>
        <div className="marketplace__journey-steps">
          <div>
            <span className="marketplace__journey-number">1</span>
            <h3>Say hello</h3>
            <p>Share your family story, ask questions, and schedule a virtual visit.</p>
          </div>
          <div>
            <span className="marketplace__journey-number">2</span>
            <h3>Reserve your kitten</h3>
            <p>Place a refundable deposit or bid confidently — we hold your match.</p>
          </div>
          <div>
            <span className="marketplace__journey-number">3</span>
            <h3>Prepare for cuddle day</h3>
            <p>Receive weekly updates, vet records, and a take-home guide for a smooth arrival.</p>
          </div>
        </div>
        <p className="marketplace__journey-footnote">
          Ready to chat? Leave a bid with a note or call us anytime — we respond within the day.
        </p>
      </section>

      <AnimatePresence initial={false} mode="wait">
        {selected ? (
          <KittenDetailSheet
            key={selected.id}
            kitten={selected}
            onClose={() => setSelected(null)}
            onCheckout={handleCheckout}
            onAddBid={handleAddBid}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
