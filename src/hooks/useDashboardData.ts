import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Vorgaenge, AnforderungenUndRandbedingungen, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Annahmen, Regeln } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'vorgaenge' | 'anforderungen_und_randbedingungen' | 'entscheidungen_und_loesungswege' | 'ergebnisse_und_grenzen' | 'annahmen' | 'regeln';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [vorgaenge, setVorgaenge] = useState<Vorgaenge[]>([]);
  const [anforderungenUndRandbedingungen, setAnforderungenUndRandbedingungen] = useState<AnforderungenUndRandbedingungen[]>([]);
  const [entscheidungenUndLoesungswege, setEntscheidungenUndLoesungswege] = useState<EntscheidungenUndLoesungswege[]>([]);
  const [ergebnisseUndGrenzen, setErgebnisseUndGrenzen] = useState<ErgebnisseUndGrenzen[]>([]);
  const [annahmen, setAnnahmen] = useState<Annahmen[]>([]);
  const [regeln, setRegeln] = useState<Regeln[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  /** Lists the signed-in user may not read (403 on the platform). They load as
   *  empty and the rest of the page loads normally — one forbidden list used to
   *  empty the whole dashboard (05.10.2026). Hide a block whose list is here. */
  const [forbidden, setForbidden] = useState<DashboardEntity[]>([]);

  // Every list on its own: a 403 is „not yours“, any other failure is an error.
  const settle = useCallback((settled: PromiseSettledResult<unknown>[]) => {
    const denied: DashboardEntity[] = [];
    let failure: unknown = null;
    // null = this list failed for another reason: its current data stays
    const pick = <T,>(i: number, key: DashboardEntity): T[] | null => {
      const s = settled[i];
      if (s.status === 'fulfilled') return s.value as T[];
      if ((s.reason as { status?: number } | null)?.status === 403) { denied.push(key); return []; }
      failure = failure ?? s.reason;
      return null;
    };
    { const rows = pick<Vorgaenge>(0, 'vorgaenge'); if (rows) setVorgaenge(rows); }
    { const rows = pick<AnforderungenUndRandbedingungen>(1, 'anforderungen_und_randbedingungen'); if (rows) setAnforderungenUndRandbedingungen(rows); }
    { const rows = pick<EntscheidungenUndLoesungswege>(2, 'entscheidungen_und_loesungswege'); if (rows) setEntscheidungenUndLoesungswege(rows); }
    { const rows = pick<ErgebnisseUndGrenzen>(3, 'ergebnisse_und_grenzen'); if (rows) setErgebnisseUndGrenzen(rows); }
    { const rows = pick<Annahmen>(4, 'annahmen'); if (rows) setAnnahmen(rows); }
    { const rows = pick<Regeln>(5, 'regeln'); if (rows) setRegeln(rows); }
    setForbidden(prev => (prev.join('|') === denied.join('|') ? prev : denied));
    return failure;
  }, []);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const failure = settle(await Promise.allSettled([
        omit.has('vorgaenge') ? Promise.resolve([] as Vorgaenge[]) : LivingAppsService.getVorgaenge(),
        omit.has('anforderungen_und_randbedingungen') ? Promise.resolve([] as AnforderungenUndRandbedingungen[]) : LivingAppsService.getAnforderungenUndRandbedingungen(),
        omit.has('entscheidungen_und_loesungswege') ? Promise.resolve([] as EntscheidungenUndLoesungswege[]) : LivingAppsService.getEntscheidungenUndLoesungswege(),
        omit.has('ergebnisse_und_grenzen') ? Promise.resolve([] as ErgebnisseUndGrenzen[]) : LivingAppsService.getErgebnisseUndGrenzen(),
        omit.has('annahmen') ? Promise.resolve([] as Annahmen[]) : LivingAppsService.getAnnahmen(),
        omit.has('regeln') ? Promise.resolve([] as Regeln[]) : LivingAppsService.getRegeln(),
      ]));
      if (failure) throw failure;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey, settle]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        // a failed list keeps its stale data out of the way: settle() only
        // replaces what loaded or was refused
        settle(await Promise.allSettled([
          omit.has('vorgaenge') ? Promise.resolve([] as Vorgaenge[]) : LivingAppsService.getVorgaenge(),
          omit.has('anforderungen_und_randbedingungen') ? Promise.resolve([] as AnforderungenUndRandbedingungen[]) : LivingAppsService.getAnforderungenUndRandbedingungen(),
          omit.has('entscheidungen_und_loesungswege') ? Promise.resolve([] as EntscheidungenUndLoesungswege[]) : LivingAppsService.getEntscheidungenUndLoesungswege(),
          omit.has('ergebnisse_und_grenzen') ? Promise.resolve([] as ErgebnisseUndGrenzen[]) : LivingAppsService.getErgebnisseUndGrenzen(),
          omit.has('annahmen') ? Promise.resolve([] as Annahmen[]) : LivingAppsService.getAnnahmen(),
          omit.has('regeln') ? Promise.resolve([] as Regeln[]) : LivingAppsService.getRegeln(),
        ]));
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey, settle]);

  const vorgaengeMap = useMemo(() => {
    const m = new Map<string, Vorgaenge>();
    vorgaenge.forEach(r => m.set(r.record_id, r));
    return m;
  }, [vorgaenge]);

  const anforderungenUndRandbedingungenMap = useMemo(() => {
    const m = new Map<string, AnforderungenUndRandbedingungen>();
    anforderungenUndRandbedingungen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [anforderungenUndRandbedingungen]);

  const entscheidungenUndLoesungswegeMap = useMemo(() => {
    const m = new Map<string, EntscheidungenUndLoesungswege>();
    entscheidungenUndLoesungswege.forEach(r => m.set(r.record_id, r));
    return m;
  }, [entscheidungenUndLoesungswege]);

  const ergebnisseUndGrenzenMap = useMemo(() => {
    const m = new Map<string, ErgebnisseUndGrenzen>();
    ergebnisseUndGrenzen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [ergebnisseUndGrenzen]);

  const annahmenMap = useMemo(() => {
    const m = new Map<string, Annahmen>();
    annahmen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [annahmen]);

  return { vorgaenge, setVorgaenge, anforderungenUndRandbedingungen, setAnforderungenUndRandbedingungen, entscheidungenUndLoesungswege, setEntscheidungenUndLoesungswege, ergebnisseUndGrenzen, setErgebnisseUndGrenzen, annahmen, setAnnahmen, regeln, setRegeln, loading, error, fetchAll, forbidden, vorgaengeMap, anforderungenUndRandbedingungenMap, entscheidungenUndLoesungswegeMap, ergebnisseUndGrenzenMap, annahmenMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;