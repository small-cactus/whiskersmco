import type { CheckoutActionType, Kitten } from '../types';
import { formatCurrency } from '../utils/format';

interface KittenCardProps {
  kitten: Kitten;
  onViewDetails: (kitten: Kitten) => void;
  onCheckout: (kitten: Kitten, action: CheckoutActionType) => void;
  isHeroAnchor?: boolean;
}

const statusCopy: Record<Kitten['status'], string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Adopted',
};

export function KittenCard({
  kitten,
  onViewDetails,
  onCheckout,
  isHeroAnchor = false,
}: KittenCardProps) {
  const highestBid = kitten.bids[0]?.amount ?? null;

  const isSold = kitten.status === 'sold';
  const isReserved = kitten.status === 'reserved';

  return (
    <article
      className="kitten-card"
      aria-label={`${kitten.name} profile`}
      data-first-kitten={isHeroAnchor ? 'true' : undefined}
    >
      <button
        type="button"
        className="kitten-card__media"
        onClick={() => onViewDetails(kitten)}
        aria-label={`View details for ${kitten.name}`}
      >
        <img
          src={kitten.heroImage}
          alt={`${kitten.name} the maine coon kitten`}
          loading="lazy"
        />
        <div className={`kitten-card__status status-${kitten.status}`}>
          {statusCopy[kitten.status]}
        </div>
      </button>
      <div className="kitten-card__body">
        <header>
          <h3>{kitten.name}</h3>
          <p>{kitten.tagline}</p>
        </header>
        <dl className="kitten-card__stats">
          <div>
            <dt>Ready Home</dt>
            <dd>
              {new Date(kitten.birthdate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{kitten.weightLbs.toFixed(1)} lbs</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{kitten.color}</dd>
          </div>
        </dl>
        <div className="kitten-card__pricing">
          <span className="kitten-card__price">
            {formatCurrency(kitten.price)}
          </span>
          <div className="kitten-card__pricing-meta">
            <span className="kitten-card__deposit">
              Deposit {formatCurrency(kitten.depositAmount)}
            </span>
            <span className="kitten-card__bid">
              {highestBid
                ? `Top bid ${formatCurrency(highestBid)}`
                : 'No bids yet'}
            </span>
          </div>
        </div>
      </div>
      <footer className="kitten-card__actions">
        <button
          type="button"
          className="btn-outline"
          onClick={() => onViewDetails(kitten)}
        >
          View more
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onCheckout(kitten, 'deposit')}
          disabled={isReserved || isSold}
        >
          {isReserved ? 'Reserved' : 'Reserve'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onCheckout(kitten, 'purchase')}
          disabled={isSold}
        >
          {isSold ? 'Adopted' : 'Buy now'}
        </button>
      </footer>
    </article>
  );
}
