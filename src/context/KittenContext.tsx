import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { seedKittens } from '../data/seed';
import type { Bid, Kitten, KittenDraft, KittenStatus } from '../types';
import { getSupabaseClient } from '../lib/supabaseClient';

const nowIso = () => new Date().toISOString();

const createLocalId = (name: string) => {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'kitten';

  const fallback = Math.random().toString(36).slice(2, 8);

  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `${base}-${window.crypto.randomUUID().slice(0, 8)}`;
  }

  return `${base}-${fallback}`;
};

const normalizeBid = (bid: Partial<Bid> & { message?: string | null }): Bid => ({
  id: bid.id ?? createLocalId('bid'),
  bidderName: bid.bidderName ?? 'Anonymous',
  amount: Number(bid.amount ?? 0),
  message: bid.message ?? undefined,
  placedAt: bid.placedAt ?? nowIso(),
});

const normalizeKitten = (kitten: Partial<Kitten>): Kitten => {
  const bidsSource = kitten.bids as unknown;
  const bids = Array.isArray(bidsSource)
    ? (bidsSource as Partial<Bid>[])
        .map(normalizeBid)
        .sort(
          (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
        )
    : [];

  const traitsSource = kitten.traits as unknown;
  const traits = Array.isArray(traitsSource)
    ? traitsSource
        .map((item) => (typeof item === 'string' ? item : String(item)))
        .filter(Boolean)
    : typeof traitsSource === 'string'
      ? traitsSource
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const gallerySource = kitten.gallery as unknown;
  let gallery: string[] = [];
  if (Array.isArray(gallerySource)) {
    gallery = gallerySource
      .map((item) => (typeof item === 'string' ? item : String(item)))
      .filter(Boolean);
  } else if (typeof gallerySource === 'string') {
    try {
      const parsed = JSON.parse(gallerySource);
      if (Array.isArray(parsed)) {
        gallery = parsed
          .map((item) => (typeof item === 'string' ? item : String(item)))
          .filter(Boolean);
      }
    } catch {
      gallery = gallerySource
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return {
    id: kitten.id ?? createLocalId(kitten.name ?? 'kitten'),
    name: kitten.name ?? 'Unnamed kitten',
    tagline: kitten.tagline ?? '',
    birthdate: kitten.birthdate ?? nowIso(),
    gender: kitten.gender === 'male' ? 'male' : 'female',
    color: kitten.color ?? '',
    weightLbs: Number(kitten.weightLbs ?? 0),
    description: kitten.description ?? '',
    traits,
    groomingNeeds: kitten.groomingNeeds ?? '',
    healthNotes: kitten.healthNotes ?? '',
    price: Number(kitten.price ?? 0),
    depositAmount: Number(kitten.depositAmount ?? 0),
    depositCheckoutUrl: kitten.depositCheckoutUrl ?? '',
    buyNowCheckoutUrl: kitten.buyNowCheckoutUrl ?? '',
    status: kitten.status ?? 'available',
    heroImage:
      kitten.heroImage ??
      'https://images.unsplash.com/photo-1603320185910-b361ee9e9be1?auto=format&fit=crop&w=1200&q=80',
    gallery,
    bids,
    createdAt: kitten.createdAt ?? nowIso(),
    updatedAt: kitten.updatedAt ?? nowIso(),
    featured: Boolean(kitten.featured),
  };
};

interface KittenContextValue {
  kittens: Kitten[];
  loading: boolean;
  error: string | null;
  usingSupabase: boolean;
  refresh: () => Promise<void>;
  saveKitten: (draft: KittenDraft) => Promise<Kitten>;
  removeKitten: (kittenId: string) => Promise<void>;
  addBid: (
    kittenId: string,
    bid: Omit<Bid, 'id' | 'placedAt'>,
  ) => Promise<{ ok: boolean; error?: string }>;
  setKittenStatus: (kittenId: string, status: KittenStatus) => Promise<void>;
}

const KittenContext = createContext<KittenContextValue | undefined>(undefined);

export function KittenProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState(() => getSupabaseClient());
  const usingSupabase = Boolean(supabase);

  useEffect(() => {
    if (supabase) return;
    if (typeof window === 'undefined') return;

    let attempts = 0;
    let active = true;

    const tryConnect = () => {
      const next = getSupabaseClient();
      if (next && active) {
        setSupabase(next);
        return true;
      }
      return false;
    };

    if (tryConnect()) return;

    const intervalId = window.setInterval(() => {
      attempts += 1;
      if (tryConnect() || attempts >= 6) {
        window.clearInterval(intervalId);
      }
    }, 500);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [supabase]);

  const [kittens, setKittens] = useState<Kitten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKittens = useCallback(async () => {
    setLoading(true);
    if (supabase && usingSupabase) {
      const { data, error: fetchError } = await supabase
        .from('kittens')
        .select('*, bids(*)')
        .order('createdAt', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setKittens([]);
      } else if (Array.isArray(data)) {
        setError(null);
        setKittens(data.map((item) => normalizeKitten(item)));
      } else {
        setKittens([]);
      }
    } else {
      setError(null);
      setKittens(seedKittens.map((kitten) => normalizeKitten(kitten)));
    }
    setLoading(false);
  }, [supabase, usingSupabase]);

  useEffect(() => {
    loadKittens();
  }, [loadKittens]);

  useEffect(() => {
    if (!supabase || !usingSupabase) return;

    const channel = supabase
      .channel('kittens-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'kittens' },
        () => {
          loadKittens();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => {
          loadKittens();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, usingSupabase, loadKittens]);

  const saveKitten = useCallback(
    async (draft: KittenDraft): Promise<Kitten> => {
      const timestamp = nowIso();

      if (supabase && usingSupabase) {
        const baseId = draft.id ?? createLocalId(draft.name);
        const payload = {
          id: baseId,
          name: draft.name,
          tagline: draft.tagline,
          birthdate: draft.birthdate,
          gender: draft.gender,
          color: draft.color,
          weightLbs: Number(draft.weightLbs),
          description: draft.description,
          traits: draft.traits,
          groomingNeeds: draft.groomingNeeds,
          healthNotes: draft.healthNotes,
          price: Number(draft.price),
          depositAmount: Number(draft.depositAmount),
          depositCheckoutUrl: draft.depositCheckoutUrl,
          buyNowCheckoutUrl: draft.buyNowCheckoutUrl,
          status: draft.status ?? 'available',
          heroImage: draft.heroImage,
          gallery: draft.gallery,
          featured: Boolean(draft.featured),
          updatedAt: timestamp,
          ...(draft.id ? {} : { createdAt: timestamp }),
        };

        const { data, error: upsertError } = await supabase
          .from('kittens')
          .upsert(payload, { onConflict: 'id' })
          .select('*, bids(*)')
          .single();

        if (upsertError || !data) {
          throw new Error(upsertError?.message ?? 'Unable to save kitten');
        }

        const kitten = normalizeKitten(data);
        setKittens((previous) => {
          const exists = previous.some((item) => item.id === kitten.id);
          if (exists) {
            return previous.map((item) =>
              item.id === kitten.id ? kitten : item,
            );
          }
          return [kitten, ...previous];
        });

        return kitten;
      }

      const id = draft.id ?? createLocalId(draft.name);
      const existing = kittens.find((kitten) => kitten.id === id);

      const kitten = normalizeKitten({
        ...draft,
        id,
        status: draft.status ?? existing?.status ?? 'available',
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        bids: existing?.bids ?? [],
      });

      setKittens((previous) => {
        const filtered = previous.filter((item) => item.id !== id);
        return [kitten, ...filtered];
      });

      return kitten;
    },
    [kittens, supabase, usingSupabase],
  );

  const removeKitten = useCallback(
    async (kittenId: string) => {
      if (supabase && usingSupabase) {
        const { error: deleteError } = await supabase
          .from('kittens')
          .delete()
          .eq('id', kittenId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }

      setKittens((previous) =>
        previous.filter((kitten) => kitten.id !== kittenId),
      );
    },
    [supabase, usingSupabase],
  );

  const addBid = useCallback(
    async (kittenId: string, bidInput: Omit<Bid, 'id' | 'placedAt'>) => {
      const target = kittens.find((kitten) => kitten.id === kittenId);
      if (!target) {
        return { ok: false, error: 'Kitten not found' };
      }

      const highestBid = target.bids.reduce(
        (max, current) => Math.max(max, current.amount),
        0,
      );

      if (bidInput.amount <= Math.max(highestBid, target.price * 0.7)) {
        return {
          ok: false,
          error: `Bid must be greater than $${Math.max(
            highestBid,
            target.price * 0.7,
          ).toFixed(0)}`,
        };
      }

      const bidPayload = {
        kittenId,
        bidderName: bidInput.bidderName.trim(),
        amount: Number(bidInput.amount),
        message: bidInput.message ?? null,
        placedAt: nowIso(),
      };

      if (supabase && usingSupabase) {
        const { data, error: insertError } = await supabase
          .from('bids')
          .insert(bidPayload)
          .select('*')
          .single();

        if (insertError || !data) {
          return {
            ok: false,
            error: insertError?.message ?? 'Unable to submit bid right now.',
          };
        }

        const nextBid = normalizeBid({
          ...data,
          message: data.message ?? undefined,
        });
        setKittens((previous) =>
          previous.map((kitten) =>
            kitten.id === kittenId
              ? { ...kitten, bids: [nextBid, ...kitten.bids] }
              : kitten,
          ),
        );

        return { ok: true };
      }

      const generatedBid: Bid = normalizeBid({
        ...bidPayload,
        message: bidPayload.message ?? undefined,
        id: createLocalId('bid'),
      });

      setKittens((previous) =>
        previous.map((kitten) =>
          kitten.id === kittenId
            ? { ...kitten, bids: [generatedBid, ...kitten.bids] }
            : kitten,
        ),
      );

      return { ok: true };
    },
    [kittens, supabase, usingSupabase],
  );

  const setKittenStatus = useCallback(
    async (kittenId: string, status: KittenStatus) => {
      if (supabase && usingSupabase) {
        const { data, error: updateError } = await supabase
          .from('kittens')
          .update({ status, updatedAt: nowIso() })
          .eq('id', kittenId)
          .select('*, bids(*)')
          .single();

        if (updateError || !data) {
          throw new Error(updateError?.message ?? 'Unable to update status');
        }

        const updated = normalizeKitten(data);
        setKittens((previous) =>
          previous.map((kitten) =>
            kitten.id === updated.id ? updated : kitten,
          ),
        );
        return;
      }

      setKittens((previous) =>
        previous.map((kitten) =>
          kitten.id === kittenId
            ? { ...kitten, status, updatedAt: nowIso() }
            : kitten,
        ),
      );
    },
    [supabase, usingSupabase],
  );

  const value = useMemo<KittenContextValue>(
    () => ({
      kittens,
      loading,
      error,
      usingSupabase,
      refresh: loadKittens,
      saveKitten,
      removeKitten,
      addBid,
      setKittenStatus,
    }),
    [
      kittens,
      loading,
      error,
      usingSupabase,
      loadKittens,
      saveKitten,
      removeKitten,
      addBid,
      setKittenStatus,
    ],
  );

  return (
    <KittenContext.Provider value={value}>{children}</KittenContext.Provider>
  );
}

export const useKittenContext = () => {
  const context = useContext(KittenContext);
  if (!context) {
    throw new Error('useKittenContext must be used within a KittenProvider');
  }
  return context;
};

export const useKittenById = (kittenId: string | null | undefined) => {
  const { kittens } = useKittenContext();
  return kittens.find((kitten) => kitten.id === kittenId) ?? null;
};
