import { useEffect, useMemo, useState } from 'react';
import type {
  CheckoutActionType,
  Kitten,
  KittenStatus,
} from '../types';
import {
  calculateAgeInWeeks,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../utils/format';

interface KittenDetailSheetProps {
  kitten: Kitten;
  onClose: () => void;
  onCheckout: (kitten: Kitten, action: CheckoutActionType) => void;
  onAddBid: (
    kittenId: string,
    payload: { bidderName: string; amount: number; message?: string },
  ) => Promise<{ ok: boolean; error?: string }>;
}

const statusLabel: Record<KittenStatus, string> = {
  available: 'Available',
  reserved: 'Reserved — deposit received',
  sold: 'Adopted — home confirmed',
};

export function KittenDetailSheet({
  kitten,
  onClose,
  onCheckout,
  onAddBid,
}: KittenDetailSheetProps) {
  const [bidderName, setBidderName] = useState('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    setBidderName('');
    setBidAmount('');
    setMessage('');
    setFeedback(null);
    setIsSubmittingBid(false);
    setError(null);
  }, [kitten.id]);

  const highestBid = useMemo(
    () => (kitten.bids.length ? kitten.bids[0] : null),
    [kitten.bids],
  );

  const ageWeeks = calculateAgeInWeeks(kitten.birthdate);

  const handleBidSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amountNumber = Number.parseFloat(bidAmount);
    if (!bidderName.trim()) {
      setError('Please share your name so we can follow up.');
      return;
    }
    if (!Number.isFinite(amountNumber)) {
      setError('Enter a valid bid amount.');
      return;
    }

    setIsSubmittingBid(true);

    try {
      const result = await onAddBid(kitten.id, {
        bidderName: bidderName.trim(),
        amount: amountNumber,
        message: message.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error ?? 'Unable to place bid. Try again.');
        return;
      }

      setError(null);
      setFeedback('Bid received. We will reach out shortly!');
      setBidAmount('');
      setMessage('');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const isReserved = kitten.status === 'reserved';
  const isSold = kitten.status === 'sold';

  return (
    <div className="kitten-sheet" role="dialog" aria-modal="true">
      <div className="kitten-sheet__backdrop" onClick={onClose} />
      <section className="kitten-sheet__panel">
        <header className="kitten-sheet__header">
          <button
            type="button"
            className="kitten-sheet__close"
            onClick={onClose}
            aria-label="Close details"
          >
            ✕
          </button>
          <div>
            <p className="kitten-sheet__tagline">{kitten.tagline}</p>
            <h2>{kitten.name}</h2>
            <p className={`status status-${kitten.status}`}>
              {statusLabel[kitten.status]}
            </p>
          </div>
          <div className="kitten-sheet__hero">
            <img
              src={kitten.heroImage}
              alt={`${kitten.name} smiling`}
              loading="lazy"
            />
          </div>
        </header>

        <div className="kitten-sheet__gallery" aria-label="More photos">
          {[kitten.heroImage, ...kitten.gallery].map((imageSrc, index) => (
            <img
              key={`${kitten.id}-gallery-${index}`}
              src={imageSrc}
              alt={`${kitten.name} photo ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>

        <section className="kitten-sheet__overview">
          <div>
            <h3>Investment</h3>
            <p className="kitten-sheet__price">
              {formatCurrency(kitten.price)}
              <span>Buy now</span>
            </p>
            <p className="kitten-sheet__deposit">
              Reserve with {formatCurrency(kitten.depositAmount)}
            </p>
          </div>
          <div className="kitten-sheet__facts">
            <div>
              <span>Age</span>
              <strong>
                {ageWeeks !== null ? `${ageWeeks} weeks` : '—'}
              </strong>
            </div>
            <div>
              <span>Ready home</span>
              <strong>{formatDate(kitten.birthdate)}</strong>
            </div>
            <div>
              <span>Color</span>
              <strong>{kitten.color}</strong>
            </div>
            <div>
              <span>Weight</span>
              <strong>{kitten.weightLbs.toFixed(1)} lbs</strong>
            </div>
            <div>
              <span>Grooming</span>
              <strong>{kitten.groomingNeeds}</strong>
            </div>
            <div>
              <span>Health</span>
              <strong>{kitten.healthNotes}</strong>
            </div>
          </div>
        </section>

        <section className="kitten-sheet__description">
          <h3>Meet {kitten.name}</h3>
          <p>{kitten.description}</p>
          <ul className="kitten-sheet__traits">
            {kitten.traits.map((trait) => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </section>

        <section className="kitten-sheet__bids" aria-label="Bids">
          <div className="kitten-sheet__bids-header">
            <h3>Live bids</h3>
            {highestBid && (
              <p>
                Highest bid: <strong>{formatCurrency(highestBid.amount)}</strong>
              </p>
            )}
          </div>
          {kitten.bids.length > 0 ? (
            <ul className="kitten-sheet__bid-list">
              {kitten.bids.slice(0, 4).map((bid) => (
                <li key={bid.id}>
                  <div>
                    <strong>{bid.bidderName}</strong>
                    <span>{formatDateTime(bid.placedAt)}</span>
                  </div>
                  <p>{formatCurrency(bid.amount)}</p>
                  {bid.message ? <blockquote>{bid.message}</blockquote> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="kitten-sheet__no-bids">
              No bids yet. Leave an offer and we will follow up same-day.
            </p>
          )}
          <form className="kitten-sheet__bid-form" onSubmit={handleBidSubmit}>
            <label htmlFor="bidder-name">Your name</label>
            <input
              id="bidder-name"
              value={bidderName}
              onChange={(event) => setBidderName(event.target.value)}
              placeholder="First & last name"
              required
            />
            <label htmlFor="bid-amount">Bid amount (USD)</label>
            <input
              id="bid-amount"
              value={bidAmount}
              inputMode="decimal"
              onChange={(event) => setBidAmount(event.target.value)}
              placeholder="2900"
              required
            />
            <label htmlFor="bid-message">
              Note (optional, allergies, timing, etc.)
            </label>
            <textarea
              id="bid-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
            />
            {error ? <p className="form-error">{error}</p> : null}
            {feedback ? <p className="form-success">{feedback}</p> : null}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmittingBid}
            >
              {isSubmittingBid ? 'Submitting…' : 'Submit bid'}
            </button>
          </form>
        </section>

        <footer className="kitten-sheet__actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onCheckout(kitten, 'deposit')}
            disabled={isReserved || isSold}
          >
            Reserve for {formatCurrency(kitten.depositAmount)}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onCheckout(kitten, 'purchase')}
            disabled={isSold}
          >
            Buy now {formatCurrency(kitten.price)}
          </button>
        </footer>
      </section>
    </div>
  );
}
