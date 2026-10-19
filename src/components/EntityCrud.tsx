/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'vorgaenge'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.vorgaenge.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.vorgaenge.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.vorgaenge.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.vorgaenge              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   vorgaenge: titel, beschreibung, bereich, verantwortlich_vorname, verantwortlich_nachname, status, startdatum, enddatum, …  ·  ← anforderungen_und_randbedingungen (list + contextual +) · ← entscheidungen_und_loesungswege (list + contextual +) · ← ergebnisse_und_grenzen (list + contextual +) · ← annahmen (list + contextual +) · ← regeln (list + contextual +)
 *   anforderungen_und_randbedingungen: vorgang, art, titel, beschreibung, quelle, prioritaet, verlaesslichkeit, erfassungsdatum  ·  → vorgaenge · ← entscheidungen_und_loesungswege (list + contextual +)
 *   entscheidungen_und_loesungswege: vorgang, anforderung, titel, entscheidungsdatum, entscheider_vorname, entscheider_nachname, begruendung, alternativen, …  ·  → vorgaenge · → anforderungen_und_randbedingungen · ← ergebnisse_und_grenzen (list + contextual +) · ← regeln (list + contextual +)
 *   ergebnisse_und_grenzen: vorgang, entscheidung, art, titel, beschreibung, beobachtungsdatum, bewertung, verlaesslichkeit, …  ·  → vorgaenge · → entscheidungen_und_loesungswege · ← annahmen (list + contextual +) · ← regeln (list + contextual +)
 *   annahmen: vorgang, aussage, begruendung, verlaesslichkeit, pruefstatus, pruefdatum, pruefergebnis, stuetzendes_ergebnis  ·  → vorgaenge · → ergebnisse_und_grenzen · ← regeln (list + contextual +)
 *   regeln: titel, regeltext, geltungsbereich, vorgang, entscheidung, ergebnis, annahme, verlaesslichkeitsgrad, …  ·  → vorgaenge · → entscheidungen_und_loesungswege · → ergebnisse_und_grenzen · → annahmen
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Vorgaenge, AnforderungenUndRandbedingungen, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Annahmen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichAnforderungenUndRandbedingungen, enrichEntscheidungenUndLoesungswege, enrichErgebnisseUndGrenzen, enrichAnnahmen, enrichRegeln } from '@/lib/enrich';
import type { EnrichedAnforderungenUndRandbedingungen, EnrichedEntscheidungenUndLoesungswege, EnrichedErgebnisseUndGrenzen, EnrichedAnnahmen, EnrichedRegeln } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { VorgaengeDialog, type VorgaengeDialogDefaults } from '@/components/dialogs/VorgaengeDialog';
import { VorgaengeDetails } from '@/components/details/VorgaengeDetails';
import { AnforderungenUndRandbedingungenDialog, type AnforderungenUndRandbedingungenDialogDefaults } from '@/components/dialogs/AnforderungenUndRandbedingungenDialog';
import { AnforderungenUndRandbedingungenDetails } from '@/components/details/AnforderungenUndRandbedingungenDetails';
import { EntscheidungenUndLoesungswegeDialog, type EntscheidungenUndLoesungswegeDialogDefaults } from '@/components/dialogs/EntscheidungenUndLoesungswegeDialog';
import { EntscheidungenUndLoesungswegeDetails } from '@/components/details/EntscheidungenUndLoesungswegeDetails';
import { ErgebnisseUndGrenzenDialog, type ErgebnisseUndGrenzenDialogDefaults } from '@/components/dialogs/ErgebnisseUndGrenzenDialog';
import { ErgebnisseUndGrenzenDetails } from '@/components/details/ErgebnisseUndGrenzenDetails';
import { AnnahmenDialog, type AnnahmenDialogDefaults } from '@/components/dialogs/AnnahmenDialog';
import { AnnahmenDetails } from '@/components/details/AnnahmenDetails';
import { RegelnDialog, type RegelnDialogDefaults } from '@/components/dialogs/RegelnDialog';
import { RegelnDetails } from '@/components/details/RegelnDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'vorgaenge'; record: Vorgaenge }
  | { type: 'anforderungenUndRandbedingungen'; record: EnrichedAnforderungenUndRandbedingungen }
  | { type: 'entscheidungenUndLoesungswege'; record: EnrichedEntscheidungenUndLoesungswege }
  | { type: 'ergebnisseUndGrenzen'; record: EnrichedErgebnisseUndGrenzen }
  | { type: 'annahmen'; record: EnrichedAnnahmen }
  | { type: 'regeln'; record: EnrichedRegeln };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  vorgaenge: EntityCrudApi<Vorgaenge, VorgaengeDialogDefaults>;
  anforderungenUndRandbedingungen: EntityCrudApi<AnforderungenUndRandbedingungen, AnforderungenUndRandbedingungenDialogDefaults>;
  entscheidungenUndLoesungswege: EntityCrudApi<EntscheidungenUndLoesungswege, EntscheidungenUndLoesungswegeDialogDefaults>;
  ergebnisseUndGrenzen: EntityCrudApi<ErgebnisseUndGrenzen, ErgebnisseUndGrenzenDialogDefaults>;
  annahmen: EntityCrudApi<Annahmen, AnnahmenDialogDefaults>;
  regeln: EntityCrudApi<Regeln, RegelnDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { vorgaenge: Vorgaenge[]; anforderungenUndRandbedingungen: EnrichedAnforderungenUndRandbedingungen[]; entscheidungenUndLoesungswege: EnrichedEntscheidungenUndLoesungswege[]; ergebnisseUndGrenzen: EnrichedErgebnisseUndGrenzen[]; annahmen: EnrichedAnnahmen[]; regeln: EnrichedRegeln[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [vorgaengeDialog, setVorgaengeDialog] = useState<{ defaults?: VorgaengeDialogDefaults; editing?: Vorgaenge } | null>(null);
  const [anforderungenUndRandbedingungenDialog, setAnforderungenUndRandbedingungenDialog] = useState<{ defaults?: AnforderungenUndRandbedingungenDialogDefaults; editing?: AnforderungenUndRandbedingungen } | null>(null);
  const [entscheidungenUndLoesungswegeDialog, setEntscheidungenUndLoesungswegeDialog] = useState<{ defaults?: EntscheidungenUndLoesungswegeDialogDefaults; editing?: EntscheidungenUndLoesungswege } | null>(null);
  const [ergebnisseUndGrenzenDialog, setErgebnisseUndGrenzenDialog] = useState<{ defaults?: ErgebnisseUndGrenzenDialogDefaults; editing?: ErgebnisseUndGrenzen } | null>(null);
  const [annahmenDialog, setAnnahmenDialog] = useState<{ defaults?: AnnahmenDialogDefaults; editing?: Annahmen } | null>(null);
  const [regelnDialog, setRegelnDialog] = useState<{ defaults?: RegelnDialogDefaults; editing?: Regeln } | null>(null);
  const enrichedAnforderungenUndRandbedingungen = useMemo(() => enrichAnforderungenUndRandbedingungen(data.anforderungenUndRandbedingungen, { vorgaengeMap: data.vorgaengeMap }), [data.anforderungenUndRandbedingungen, data.vorgaengeMap]);
  const enrichedEntscheidungenUndLoesungswege = useMemo(() => enrichEntscheidungenUndLoesungswege(data.entscheidungenUndLoesungswege, { vorgaengeMap: data.vorgaengeMap, anforderungenUndRandbedingungenMap: data.anforderungenUndRandbedingungenMap }), [data.entscheidungenUndLoesungswege, data.vorgaengeMap, data.anforderungenUndRandbedingungenMap]);
  const enrichedErgebnisseUndGrenzen = useMemo(() => enrichErgebnisseUndGrenzen(data.ergebnisseUndGrenzen, { vorgaengeMap: data.vorgaengeMap, entscheidungenUndLoesungswegeMap: data.entscheidungenUndLoesungswegeMap }), [data.ergebnisseUndGrenzen, data.vorgaengeMap, data.entscheidungenUndLoesungswegeMap]);
  const enrichedAnnahmen = useMemo(() => enrichAnnahmen(data.annahmen, { vorgaengeMap: data.vorgaengeMap, ergebnisseUndGrenzenMap: data.ergebnisseUndGrenzenMap }), [data.annahmen, data.vorgaengeMap, data.ergebnisseUndGrenzenMap]);
  const enrichedRegeln = useMemo(() => enrichRegeln(data.regeln, { vorgaengeMap: data.vorgaengeMap, entscheidungenUndLoesungswegeMap: data.entscheidungenUndLoesungswegeMap, ergebnisseUndGrenzenMap: data.ergebnisseUndGrenzenMap, annahmenMap: data.annahmenMap }), [data.regeln, data.vorgaengeMap, data.entscheidungenUndLoesungswegeMap, data.ergebnisseUndGrenzenMap, data.annahmenMap]);

  function detailVorgaenge(record: Vorgaenge, push = false) {
    const item: OverlayItem = { type: 'vorgaenge', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorgaenge(fields: Vorgaenge['fields']) {
    const editing = vorgaengeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorgaenge(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorgaengeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_updated')}`, async () => {
        data.setVorgaenge(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorgaengeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorgaengeEntry(fields);
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnforderungenUndRandbedingungen(record: AnforderungenUndRandbedingungen, push = false) {
    const rec = enrichedAnforderungenUndRandbedingungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'anforderungenUndRandbedingungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnforderungenUndRandbedingungen(fields: AnforderungenUndRandbedingungen['fields']) {
    const editing = anforderungenUndRandbedingungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnforderungenUndRandbedingungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnforderungenUndRandbedingungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('anforderungen_und_randbedingungen')} — ${t('crud_updated')}`, async () => {
        data.setAnforderungenUndRandbedingungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnforderungenUndRandbedingungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnforderungenUndRandbedingungenEntry(fields);
      undoToast(`${appLabel('anforderungen_und_randbedingungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailEntscheidungenUndLoesungswege(record: EntscheidungenUndLoesungswege, push = false) {
    const rec = enrichedEntscheidungenUndLoesungswege.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'entscheidungenUndLoesungswege', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitEntscheidungenUndLoesungswege(fields: EntscheidungenUndLoesungswege['fields']) {
    const editing = entscheidungenUndLoesungswegeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setEntscheidungenUndLoesungswege(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateEntscheidungenUndLoesungswegeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('entscheidungen_und_loesungswege')} — ${t('crud_updated')}`, async () => {
        data.setEntscheidungenUndLoesungswege(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateEntscheidungenUndLoesungswegeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createEntscheidungenUndLoesungswegeEntry(fields);
      undoToast(`${appLabel('entscheidungen_und_loesungswege')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErgebnisseUndGrenzen(record: ErgebnisseUndGrenzen, push = false) {
    const rec = enrichedErgebnisseUndGrenzen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'ergebnisseUndGrenzen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErgebnisseUndGrenzen(fields: ErgebnisseUndGrenzen['fields']) {
    const editing = ergebnisseUndGrenzenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErgebnisseUndGrenzen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErgebnisseUndGrenzenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('ergebnisse_und_grenzen')} — ${t('crud_updated')}`, async () => {
        data.setErgebnisseUndGrenzen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErgebnisseUndGrenzenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErgebnisseUndGrenzenEntry(fields);
      undoToast(`${appLabel('ergebnisse_und_grenzen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnnahmen(record: Annahmen, push = false) {
    const rec = enrichedAnnahmen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'annahmen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnnahmen(fields: Annahmen['fields']) {
    const editing = annahmenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnnahmen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnnahmenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('annahmen')} — ${t('crud_updated')}`, async () => {
        data.setAnnahmen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnnahmenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnnahmenEntry(fields);
      undoToast(`${appLabel('annahmen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegeln(record: Regeln, push = false) {
    const rec = enrichedRegeln.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regeln', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegeln(fields: Regeln['fields']) {
    const editing = regelnDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegeln(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelnEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regeln')} — ${t('crud_updated')}`, async () => {
        data.setRegeln(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelnEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelnEntry(fields);
      undoToast(`${appLabel('regeln')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <VorgaengeDialog
        open={vorgaengeDialog !== null}
        onClose={() => setVorgaengeDialog(null)}
        onSubmit={submitVorgaenge}
        defaultValues={vorgaengeDialog?.defaults}
        recordId={vorgaengeDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Vorgaenge']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorgaenge']}
      />
      <AnforderungenUndRandbedingungenDialog
        open={anforderungenUndRandbedingungenDialog !== null}
        onClose={() => setAnforderungenUndRandbedingungenDialog(null)}
        onSubmit={submitAnforderungenUndRandbedingungen}
        defaultValues={anforderungenUndRandbedingungenDialog?.defaults}
        recordId={anforderungenUndRandbedingungenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        enablePhotoScan={AI_PHOTO_SCAN['AnforderungenUndRandbedingungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['AnforderungenUndRandbedingungen']}
      />
      <EntscheidungenUndLoesungswegeDialog
        open={entscheidungenUndLoesungswegeDialog !== null}
        onClose={() => setEntscheidungenUndLoesungswegeDialog(null)}
        onSubmit={submitEntscheidungenUndLoesungswege}
        defaultValues={entscheidungenUndLoesungswegeDialog?.defaults}
        recordId={entscheidungenUndLoesungswegeDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        anforderungenUndRandbedingungenList={data.anforderungenUndRandbedingungen}
        enablePhotoScan={AI_PHOTO_SCAN['EntscheidungenUndLoesungswege']}
        enablePhotoLocation={AI_PHOTO_LOCATION['EntscheidungenUndLoesungswege']}
      />
      <ErgebnisseUndGrenzenDialog
        open={ergebnisseUndGrenzenDialog !== null}
        onClose={() => setErgebnisseUndGrenzenDialog(null)}
        onSubmit={submitErgebnisseUndGrenzen}
        defaultValues={ergebnisseUndGrenzenDialog?.defaults}
        recordId={ergebnisseUndGrenzenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
        enablePhotoScan={AI_PHOTO_SCAN['ErgebnisseUndGrenzen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['ErgebnisseUndGrenzen']}
      />
      <AnnahmenDialog
        open={annahmenDialog !== null}
        onClose={() => setAnnahmenDialog(null)}
        onSubmit={submitAnnahmen}
        defaultValues={annahmenDialog?.defaults}
        recordId={annahmenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
        enablePhotoScan={AI_PHOTO_SCAN['Annahmen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Annahmen']}
      />
      <RegelnDialog
        open={regelnDialog !== null}
        onClose={() => setRegelnDialog(null)}
        onSubmit={submitRegeln}
        defaultValues={regelnDialog?.defaults}
        recordId={regelnDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
        ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
        annahmenList={data.annahmen}
        enablePhotoScan={AI_PHOTO_SCAN['Regeln']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Regeln']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'vorgaenge') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('vorgaenge')} subtitle={top.record.fields.startdatum ? formatDate(top.record.fields.startdatum) : undefined} />
                <VorgaengeDetails
                  record={top.record}
                  anforderungenUndRandbedingungenList={data.anforderungenUndRandbedingungen}
                  onOpenAnforderungenUndRandbedingungen={(r) => detailAnforderungenUndRandbedingungen(r, true)}
                  onAddAnforderungenUndRandbedingungen={perms.canWrite('anforderungen_und_randbedingungen') ? () => setAnforderungenUndRandbedingungenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
                  onOpenEntscheidungenUndLoesungswege={(r) => detailEntscheidungenUndLoesungswege(r, true)}
                  onAddEntscheidungenUndLoesungswege={perms.canWrite('entscheidungen_und_loesungswege') ? () => setEntscheidungenUndLoesungswegeDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
                  onOpenErgebnisseUndGrenzen={(r) => detailErgebnisseUndGrenzen(r, true)}
                  onAddErgebnisseUndGrenzen={perms.canWrite('ergebnisse_und_grenzen') ? () => setErgebnisseUndGrenzenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                  onAddAnnahmen={perms.canWrite('annahmen') ? () => setAnnahmenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'anforderungenUndRandbedingungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('anforderungen_und_randbedingungen')} subtitle={top.record.fields.erfassungsdatum ? formatDate(top.record.fields.erfassungsdatum) : undefined} />
                <AnforderungenUndRandbedingungenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
                  onOpenEntscheidungenUndLoesungswege={(r) => detailEntscheidungenUndLoesungswege(r, true)}
                  onAddEntscheidungenUndLoesungswege={perms.canWrite('entscheidungen_und_loesungswege') ? () => setEntscheidungenUndLoesungswegeDialog({ defaults: { anforderung: createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_RANDBEDINGUNGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'entscheidungenUndLoesungswege') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('entscheidungen_und_loesungswege')} subtitle={top.record.fields.entscheidungsdatum ? formatDate(top.record.fields.entscheidungsdatum) : undefined} />
                <EntscheidungenUndLoesungswegeDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  anforderungenUndRandbedingungenList={data.anforderungenUndRandbedingungen}
                  onOpenAnforderungenUndRandbedingungen={(r) => detailAnforderungenUndRandbedingungen(r, true)}
                  ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
                  onOpenErgebnisseUndGrenzen={(r) => detailErgebnisseUndGrenzen(r, true)}
                  onAddErgebnisseUndGrenzen={perms.canWrite('ergebnisse_und_grenzen') ? () => setErgebnisseUndGrenzenDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN_UND_LOESUNGSWEGE, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { entscheidung: createRecordUrl(APP_IDS.ENTSCHEIDUNGEN_UND_LOESUNGSWEGE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'ergebnisseUndGrenzen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('ergebnisse_und_grenzen')} subtitle={top.record.fields.beobachtungsdatum ? formatDate(top.record.fields.beobachtungsdatum) : undefined} />
                <ErgebnisseUndGrenzenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
                  onOpenEntscheidungenUndLoesungswege={(r) => detailEntscheidungenUndLoesungswege(r, true)}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                  onAddAnnahmen={perms.canWrite('annahmen') ? () => setAnnahmenDialog({ defaults: { stuetzendes_ergebnis: createRecordUrl(APP_IDS.ERGEBNISSE_UND_GRENZEN, top.record.record_id) } }) : undefined}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { ergebnis: createRecordUrl(APP_IDS.ERGEBNISSE_UND_GRENZEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'annahmen') {
            return (
              <>
                <RecordHeader title={appLabel('annahmen')} subtitle={top.record.fields.pruefdatum ? formatDate(top.record.fields.pruefdatum) : undefined} />
                <AnnahmenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
                  onOpenErgebnisseUndGrenzen={(r) => detailErgebnisseUndGrenzen(r, true)}
                  regelnList={data.regeln}
                  onOpenRegeln={(r) => detailRegeln(r, true)}
                  onAddRegeln={perms.canWrite('regeln') ? () => setRegelnDialog({ defaults: { annahme: createRecordUrl(APP_IDS.ANNAHMEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'regeln') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('regeln')} subtitle={top.record.fields.gueltig_ab ? formatDate(top.record.fields.gueltig_ab) : undefined} />
                <RegelnDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  entscheidungenUndLoesungswegeList={data.entscheidungenUndLoesungswege}
                  onOpenEntscheidungenUndLoesungswege={(r) => detailEntscheidungenUndLoesungswege(r, true)}
                  ergebnisseUndGrenzenList={data.ergebnisseUndGrenzen}
                  onOpenErgebnisseUndGrenzen={(r) => detailErgebnisseUndGrenzen(r, true)}
                  annahmenList={data.annahmen}
                  onOpenAnnahmen={(r) => detailAnnahmen(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'vorgaenge') return perms.canWrite('vorgaenge');
          if (top.type === 'anforderungenUndRandbedingungen') return perms.canWrite('anforderungen_und_randbedingungen');
          if (top.type === 'entscheidungenUndLoesungswege') return perms.canWrite('entscheidungen_und_loesungswege');
          if (top.type === 'ergebnisseUndGrenzen') return perms.canWrite('ergebnisse_und_grenzen');
          if (top.type === 'annahmen') return perms.canWrite('annahmen');
          if (top.type === 'regeln') return perms.canWrite('regeln');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'vorgaenge') setVorgaengeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'anforderungenUndRandbedingungen') setAnforderungenUndRandbedingungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'entscheidungenUndLoesungswege') setEntscheidungenUndLoesungswegeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'ergebnisseUndGrenzen') setErgebnisseUndGrenzenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'annahmen') setAnnahmenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regeln') setRegelnDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    vorgaenge: {
      openCreate: (defaults?: VorgaengeDialogDefaults) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ defaults }) : refuse()),
      openEdit: (record: Vorgaenge) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorgaenge) => detailVorgaenge(record, false),
      canWrite: perms.canWrite('vorgaenge'),
    },
    anforderungenUndRandbedingungen: {
      openCreate: (defaults?: AnforderungenUndRandbedingungenDialogDefaults) => (perms.canWrite('anforderungen_und_randbedingungen') ? setAnforderungenUndRandbedingungenDialog({ defaults }) : refuse()),
      openEdit: (record: AnforderungenUndRandbedingungen) => (perms.canWrite('anforderungen_und_randbedingungen') ? setAnforderungenUndRandbedingungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: AnforderungenUndRandbedingungen) => detailAnforderungenUndRandbedingungen(record, false),
      canWrite: perms.canWrite('anforderungen_und_randbedingungen'),
    },
    entscheidungenUndLoesungswege: {
      openCreate: (defaults?: EntscheidungenUndLoesungswegeDialogDefaults) => (perms.canWrite('entscheidungen_und_loesungswege') ? setEntscheidungenUndLoesungswegeDialog({ defaults }) : refuse()),
      openEdit: (record: EntscheidungenUndLoesungswege) => (perms.canWrite('entscheidungen_und_loesungswege') ? setEntscheidungenUndLoesungswegeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: EntscheidungenUndLoesungswege) => detailEntscheidungenUndLoesungswege(record, false),
      canWrite: perms.canWrite('entscheidungen_und_loesungswege'),
    },
    ergebnisseUndGrenzen: {
      openCreate: (defaults?: ErgebnisseUndGrenzenDialogDefaults) => (perms.canWrite('ergebnisse_und_grenzen') ? setErgebnisseUndGrenzenDialog({ defaults }) : refuse()),
      openEdit: (record: ErgebnisseUndGrenzen) => (perms.canWrite('ergebnisse_und_grenzen') ? setErgebnisseUndGrenzenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: ErgebnisseUndGrenzen) => detailErgebnisseUndGrenzen(record, false),
      canWrite: perms.canWrite('ergebnisse_und_grenzen'),
    },
    annahmen: {
      openCreate: (defaults?: AnnahmenDialogDefaults) => (perms.canWrite('annahmen') ? setAnnahmenDialog({ defaults }) : refuse()),
      openEdit: (record: Annahmen) => (perms.canWrite('annahmen') ? setAnnahmenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Annahmen) => detailAnnahmen(record, false),
      canWrite: perms.canWrite('annahmen'),
    },
    regeln: {
      openCreate: (defaults?: RegelnDialogDefaults) => (perms.canWrite('regeln') ? setRegelnDialog({ defaults }) : refuse()),
      openEdit: (record: Regeln) => (perms.canWrite('regeln') ? setRegelnDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Regeln) => detailRegeln(record, false),
      canWrite: perms.canWrite('regeln'),
    },
    enriched: { vorgaenge: data.vorgaenge, anforderungenUndRandbedingungen: enrichedAnforderungenUndRandbedingungen, entscheidungenUndLoesungswege: enrichedEntscheidungenUndLoesungswege, ergebnisseUndGrenzen: enrichedErgebnisseUndGrenzen, annahmen: enrichedAnnahmen, regeln: enrichedRegeln },
  };
}
