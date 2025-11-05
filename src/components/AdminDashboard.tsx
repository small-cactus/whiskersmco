import { useMemo, useState } from 'react';
import {
  KittenDraft,
  KittenStatus,
} from '../types';
import { useKittenContext } from '../context/KittenContext';
import { formatCurrency, formatDate } from '../utils/format';

const defaultDraft = (): KittenDraft => ({
  name: '',
  tagline: '',
  birthdate: new Date().toISOString().slice(0, 10),
  gender: 'female',
  color: '',
  weightLbs: 4.2,
  description: '',
  traits: [],
  groomingNeeds: '',
  healthNotes: '',
  price: 2800,
  depositAmount: 350,
  depositCheckoutUrl: '',
  buyNowCheckoutUrl: '',
  heroImage: '',
  gallery: [],
  status: 'available',
  featured: false,
});

const statusOrder: KittenStatus[] = ['available', 'reserved', 'sold'];

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AdminDashboard() {
  const {
    kittens,
    saveKitten,
    removeKitten,
    setKittenStatus,
    loading,
    error: contextError,
    usingSupabase,
  } = useKittenContext();
  const [draft, setDraft] = useState<KittenDraft>(defaultDraft);
  const [activeKittenId, setActiveKittenId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const combinedError = error ?? (contextError ? `Supabase: ${contextError}` : null);

  const sortedKittens = useMemo(
    () =>
      [...kittens].sort((a, b) => {
        const statusDifference =
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        if (statusDifference !== 0) return statusDifference;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    [kittens],
  );

  const currentKitten = useMemo(
    () =>
      activeKittenId
        ? kittens.find((kitten) => kitten.id === activeKittenId) ?? null
        : null,
    [activeKittenId, kittens],
  );

  const handleTraitInput = (value: string) => {
    setDraft((previous) => ({
      ...previous,
      traits: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };

  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const images = await Promise.all(Array.from(files).map(fileToDataUrl));
      setDraft((previous) => ({
        ...previous,
        gallery: [...previous.gallery, ...images],
        heroImage: previous.heroImage || images[0] || previous.heroImage,
      }));
    } catch (uploadError) {
      setError('Unable to read image file(s). Try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleSelectKitten = (kittenId: string) => {
    const kitten = kittens.find((item) => item.id === kittenId);
    if (!kitten) return;
    setActiveKittenId(kittenId);
    setDraft({
      id: kitten.id,
      name: kitten.name,
      tagline: kitten.tagline,
      birthdate: kitten.birthdate.slice(0, 10),
      gender: kitten.gender,
      color: kitten.color,
      weightLbs: kitten.weightLbs,
      description: kitten.description,
      traits: kitten.traits,
      groomingNeeds: kitten.groomingNeeds,
      healthNotes: kitten.healthNotes,
      price: kitten.price,
      depositAmount: kitten.depositAmount,
      depositCheckoutUrl: kitten.depositCheckoutUrl,
      buyNowCheckoutUrl: kitten.buyNowCheckoutUrl,
      heroImage: kitten.heroImage,
      gallery: kitten.gallery,
      status: kitten.status,
      featured: kitten.featured,
    });
    setMessage(null);
    setError(null);
  };

  const resetDraft = () => {
    setActiveKittenId(null);
    setDraft(defaultDraft());
    setMessage(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.heroImage) {
      setError('Please add a hero image so families see the kitten immediately.');
      return;
    }
    if (!draft.depositCheckoutUrl || !draft.buyNowCheckoutUrl) {
      setError('Add Stripe Payment Links so families can pay instantly.');
      return;
    }

    try {
      const saved = await saveKitten(draft);
      setMessage(
        `${saved.name} ${
          activeKittenId ? 'updated' : 'created'
        } successfully.`,
      );
      setError(null);
      setActiveKittenId(saved.id);
    } catch (submitError) {
      setMessage(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save kitten right now.',
      );
    }
  };

  const handleRemoveImage = (index: number) => {
    setDraft((previous) => {
      const nextGallery = previous.gallery.filter((_, idx) => idx !== index);
      const nextHero =
        index === 0
          ? nextGallery[0] ?? ''
          : previous.heroImage === previous.gallery[index]
            ? nextGallery[0] ?? ''
            : previous.heroImage;
      return {
        ...previous,
        gallery: nextGallery,
        heroImage: nextHero,
      };
    });
  };

  const handleDeleteKitten = async () => {
    if (!activeKittenId) return;
    const kitten = kittens.find((item) => item.id === activeKittenId);
    if (!kitten) return;
    const confirmed = window.confirm(
      `Remove ${kitten.name} from your listings? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await removeKitten(activeKittenId);
      resetDraft();
      setMessage(`${kitten.name} removed from listings.`);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove kitten.',
      );
    }
  };

  const handleStatusChange = async (kittenId: string, status: KittenStatus) => {
    try {
      await setKittenStatus(kittenId, status);
      if (kittenId === activeKittenId) {
        setDraft((previous) => ({ ...previous, status }));
      }
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : 'Unable to update status.',
      );
    }
  };

  return (
    <div className="admin">
      <header className="admin__intro">
        <h1>Breeder dashboard</h1>
        <p>
          Manage listings, pricing, and readiness in under a minute. Families see
          updates in real time — keep Stripe IDs accurate to accept deposits
          without emailing links.
        </p>
        <p className="admin__sync-status">
          Sync status:{' '}
          {usingSupabase
            ? 'Connected to Supabase'
            : 'Local demo mode (set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)'}
          {loading ? ' · Loading…' : ''}
        </p>
      </header>

      <section className="admin__layout">
        <aside className="admin__sidebar">
          <div className="admin__sidebar-head">
            <h2>All kittens</h2>
            <button type="button" onClick={resetDraft}>
              + new kitten
            </button>
          </div>
          <ul>
            {sortedKittens.map((kitten) => (
              <li
                key={kitten.id}
                className={
                  kitten.id === activeKittenId ? 'is-selected' : undefined
                }
              >
                <button type="button" onClick={() => handleSelectKitten(kitten.id)}>
                  <span>{kitten.name}</span>
                  <span className={`badge status-${kitten.status}`}>
                    {kitten.status}
                  </span>
                  <span className="price">{formatCurrency(kitten.price)}</span>
                </button>
                <div className="admin__status-controls">
                  <button
                    type="button"
                    className={kitten.status === 'available' ? 'is-active' : undefined}
                    onClick={() => handleStatusChange(kitten.id, 'available')}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    className={kitten.status === 'reserved' ? 'is-active' : undefined}
                    onClick={() => handleStatusChange(kitten.id, 'reserved')}
                  >
                    Reserved
                  </button>
                  <button
                    type="button"
                    className={kitten.status === 'sold' ? 'is-active' : undefined}
                    onClick={() => handleStatusChange(kitten.id, 'sold')}
                  >
                    Adopted
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="admin__form-wrapper">
          <form className="admin__form" onSubmit={handleSubmit}>
            <header>
              <h2>{activeKittenId ? 'Edit kitten profile' : 'Create kitten profile'}</h2>
              <p>
                Hero image, description, traits, and Stripe IDs drive the public
                listing. We recommend updating once per week.
              </p>
            </header>

            <div className="admin__fieldset">
              <label>
                Name
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Nova"
                  required
                />
              </label>
              <label>
                Tagline
                <input
                  value={draft.tagline}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      tagline: event.target.value,
                    }))
                  }
                  placeholder="Silver smoke with ocean eyes"
                  required
                />
              </label>
              <label>
                Birthdate
                <input
                  type="date"
                  value={draft.birthdate}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      birthdate: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Gender
                <select
                  value={draft.gender}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      gender: event.target.value as KittenDraft['gender'],
                    }))
                  }
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>
              <label>
                Coat color
                <input
                  value={draft.color}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      color: event.target.value,
                    }))
                  }
                  placeholder="Blue smoke"
                  required
                />
              </label>
              <label>
                Weight (lbs)
                <input
                  type="number"
                  step="0.1"
                  value={draft.weightLbs}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      weightLbs: Number(event.target.value),
                    }))
                  }
                  required
                />
              </label>
            </div>

            <div className="admin__fieldset">
              <label>
                Description
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Share temperament, routines, what makes this kitten shine."
                />
              </label>
              <label>
                Traits (comma separated)
                <input
                  value={draft.traits.join(', ')}
                  onChange={(event) => handleTraitInput(event.target.value)}
                  placeholder="Lap-lover, Clicker-trained"
                />
              </label>
              <label>
                Grooming notes
                <input
                  value={draft.groomingNeeds}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      groomingNeeds: event.target.value,
                    }))
                  }
                  placeholder="Brush 3x weekly, nails bi-weekly"
                />
              </label>
              <label>
                Health notes
                <input
                  value={draft.healthNotes}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      healthNotes: event.target.value,
                    }))
                  }
                  placeholder="Vaccinated, microchipped, parents HCM negative"
                />
              </label>
            </div>

            <div className="admin__fieldset admin__fieldset--images">
              <div className="admin__image-head">
                <div>
                  <h3>Photos</h3>
                  <p>First photo is the hero image. Drag to reorder soon — for now remove and re-upload in order.</p>
                </div>
                <label className="admin__upload">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? 'Uploading…' : 'Upload'}
                </label>
              </div>
              <div className="admin__gallery-preview">
                {draft.gallery.length === 0 ? (
                  <p className="admin__gallery-placeholder">
                    Upload 2-3 photos per kitten to build trust instantly.
                  </p>
                ) : (
                  draft.gallery.map((image, index) => (
                    <figure key={`${image}-${index}`}>
                      <img src={image} alt={`Kitten preview ${index + 1}`} />
                      <figcaption>
                        {index === 0 ? 'Hero image' : `Gallery ${index + 1}`}
                      </figcaption>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        aria-label="Remove image"
                      >
                        Remove
                      </button>
                    </figure>
                  ))
                )}
              </div>
            </div>

            <div className="admin__fieldset admin__fieldset--pricing">
              <div>
                <label>
                  Deposit amount
                  <input
                    type="number"
                    value={draft.depositAmount}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        depositAmount: Number(event.target.value),
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Stripe deposit link
                  <input
                    value={draft.depositCheckoutUrl}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        depositCheckoutUrl: event.target.value,
                      }))
                    }
                    placeholder="https://buy.stripe.com/..."
                    required
                  />
                </label>
              </div>
              <div>
                <label>
                  Adoption price
                  <input
                    type="number"
                    value={draft.price}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        price: Number(event.target.value),
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Stripe buy-now link
                  <input
                    value={draft.buyNowCheckoutUrl}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        buyNowCheckoutUrl: event.target.value,
                      }))
                    }
                    placeholder="https://buy.stripe.com/..."
                    required
                  />
                </label>
              </div>
              <label className="admin__featured">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      featured: event.target.checked,
                    }))
                  }
                />
                Feature on homepage hero
              </label>
            </div>

            {combinedError ? <p className="form-error">{combinedError}</p> : null}
            {message ? <p className="form-success">{message}</p> : null}

            <div className="admin__actions">
              <button type="submit" className="btn-primary" disabled={isUploading}>
                {activeKittenId ? 'Save updates' : 'Publish kitten'}
              </button>
              {activeKittenId ? (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleDeleteKitten}
                >
                  Remove listing
                </button>
              ) : null}
            </div>
          </form>

          {currentKitten ? (
            <section className="admin__preview">
              <h3>Live preview</h3>
              <div className="admin__preview-card">
                <img src={currentKitten.heroImage} alt={currentKitten.name} />
                <div>
                  <strong>{currentKitten.name}</strong>
                  <span>{currentKitten.tagline}</span>
                  <span>{formatCurrency(currentKitten.price)}</span>
                  <p>Updated {formatDate(currentKitten.updatedAt)}</p>
                </div>
              </div>
            </section>
          ) : null}
        </section>
      </section>
    </div>
  );
}
