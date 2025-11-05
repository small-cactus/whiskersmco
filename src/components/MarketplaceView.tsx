import { useEffect, useMemo, useState } from 'react';
import { KittenCard } from './KittenCard';
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
    ? 'Listings update instantly when saved in the breeder dashboard.'
    : 'Connect Supabase to keep listings synced across devices.';

  return (
    <div className="marketplace">
      <header className="marketplace__hero">
        <span className="marketplace__eyebrow">Family-raised kittens</span>
        <h1>Every Maine Coon leaves ready to join your home.</h1>
        <p>
          We focus on gentle temperaments, socialization, and honest updates.
          Ask questions, place a bid, or reserve right away — we help at every step.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (featured[0]) {
              setSelected(featured[0]);
            } else if (available[0]) {
              setSelected(available[0]);
            } else if (reserved[0]) {
              setSelected(reserved[0]);
            } else if (sold[0]) {
              setSelected(sold[0]);
            }
          }}
        >
          Meet the kittens
        </button>
      </header>

      {showInfo ? (
        <div className="marketplace__info">
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

      <section className="marketplace__section">
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
        <section className="marketplace__section">
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
              />
            ))}
          </div>
        </section>
      ) : null}

      {sold.length > 0 ? (
        <section className="marketplace__section">
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
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="marketplace__cta">
        <h2>How adoption works</h2>
        <ol>
          <li>Ask questions and schedule a video meet-and-greet.</li>
          <li>Place a bid or reserve with a refundable deposit.</li>
          <li>Receive weekly updates until homecoming day.</li>
        </ol>
        <p>
          Ready to chat? Leave a bid with a note or call us anytime — we answer within
          the same day.
        </p>
      </section>

      {selected ? (
        <KittenDetailSheet
          kitten={selected}
          onClose={() => setSelected(null)}
          onCheckout={handleCheckout}
          onAddBid={handleAddBid}
        />
      ) : null}
    </div>
  );
}
