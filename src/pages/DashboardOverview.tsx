import { useMemo, useState } from 'react';
import { addMonths, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconBulb, IconHelpCircle, IconRepeat, IconGavel } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';
import { LivingAppsService } from '@/services/livingAppsService';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import type { Regeln, Annahmen } from '@/types/app';
import { formatDate, lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';

type Filter = 'all' | 'offen' | 'uebergabe';

const REL_CLASS: Record<string, string> = {
  gesichert: 'text-emerald-600',
  bestaetigt: 'text-emerald-600',
  erprobt: 'text-sky-600',
  wahrscheinlich: 'text-amber-600',
  vermutet: 'text-rose-600',
  hypothese: 'text-rose-600',
};
const REL_ORDER: Record<string, number> = { vermutet: 0, wahrscheinlich: 1, gesichert: 2 };

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { vorgaenge, annahmen, regeln, entscheidungenUndLoesungswege, setAnnahmen, setRegeln, setVorgaenge, fetchAll } = data;
  const clock = useClock();
  const todayKey = format(clock, 'yyyy-MM-dd');
  const [filter, setFilter] = useState<Filter>('all');

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'annahmen' && lookupKey(top.record.fields.pruefstatus) === 'offen') {
        return { label: tx('Annahme bestätigen'), onClick: () => setPruefung(top.record, 'bestaetigt') };
      }
      if (top.type === 'regeln' && lookupKey(top.record.fields.verlaesslichkeitsgrad) === 'hypothese') {
        return { label: tx('Als erprobt markieren'), onClick: () => promoteRegel(top.record) };
      }
      return undefined;
    },
  });
  const enrichedEntscheidungen = crud.enriched.entscheidungenUndLoesungswege;
  const enrichedAnnahmen = crud.enriched.annahmen;
  const enrichedRegeln = crud.enriched.regeln;

  // ── shared write helpers (hero, work lists and overlay footer) ──
  const setPruefung = (a: Annahmen, key: 'bestaetigt' | 'widerlegt') => {
    const prev = { pruefstatus: a.fields.pruefstatus, pruefdatum: a.fields.pruefdatum };
    setAnnahmen(list => list.map(x => x.record_id === a.record_id
      ? { ...x, fields: { ...x.fields, pruefstatus: lookupOption('annahmen', 'pruefstatus', key), pruefdatum: todayKey } } : x));
    LivingAppsService.updateAnnahmenEntry(a.record_id, { pruefstatus: key, pruefdatum: todayKey }).catch(() => fetchAll());
    undoToast(key === 'bestaetigt' ? tx('Annahme bestätigt') : tx('Annahme widerlegt'), () => {
      setAnnahmen(list => list.map(x => x.record_id === a.record_id ? { ...x, fields: { ...x.fields, ...prev } } : x));
      LivingAppsService.updateAnnahmenEntry(a.record_id, {
        pruefstatus: prev.pruefstatus?.key ?? 'offen', pruefdatum: prev.pruefdatum,
      }).catch(() => fetchAll());
    });
  };

  const markGeprueft = (r: Regeln) => {
    const prev = r.fields.naechste_pruefung;
    const next = format(addMonths(clock, 6), 'yyyy-MM-dd');
    setRegeln(list => list.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, naechste_pruefung: next } } : x));
    LivingAppsService.updateRegelnEntry(r.record_id, { naechste_pruefung: next }).catch(() => fetchAll());
    undoToast(tx`Regel geprüft — nächste Prüfung ${formatDate(next)}`, () => {
      setRegeln(list => list.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, naechste_pruefung: prev } } : x));
      LivingAppsService.updateRegelnEntry(r.record_id, { naechste_pruefung: prev }).catch(() => fetchAll());
    });
  };

  const promoteRegel = (r: Regeln) => {
    const prev = r.fields.verlaesslichkeitsgrad;
    setRegeln(list => list.map(x => x.record_id === r.record_id
      ? { ...x, fields: { ...x.fields, verlaesslichkeitsgrad: lookupOption('regeln', 'verlaesslichkeitsgrad', 'erprobt') } } : x));
    LivingAppsService.updateRegelnEntry(r.record_id, { verlaesslichkeitsgrad: 'erprobt' }).catch(() => fetchAll());
    undoToast(tx('Regel als erprobt markiert'), () => {
      setRegeln(list => list.map(x => x.record_id === r.record_id ? { ...x, fields: { ...x.fields, verlaesslichkeitsgrad: prev } } : x));
      LivingAppsService.updateRegelnEntry(r.record_id, { verlaesslichkeitsgrad: prev?.key ?? 'hypothese' }).catch(() => fetchAll());
    });
  };

  // ── derived data ──
  const aktiveRegeln = useMemo(
    () => enrichedRegeln.filter(r => !['zurueckgezogen', 'ausgesetzt'].includes(lookupKey(r.fields.status) ?? '')),
    [enrichedRegeln],
  );
  const faelligeRegeln = useMemo(
    () => aktiveRegeln
      .filter(r => r.fields.naechste_pruefung && r.fields.naechste_pruefung.slice(0, 10) < todayKey)
      .sort((a, b) => (a.fields.naechste_pruefung ?? '').localeCompare(b.fields.naechste_pruefung ?? '')),
    [aktiveRegeln, todayKey],
  );
  const baldRegeln = useMemo(
    () => aktiveRegeln
      .filter(r => {
        const d = r.fields.naechste_pruefung?.slice(0, 10);
        return !!d && d >= todayKey && differenceInCalendarDays(parseISO(d), clock) <= 30;
      })
      .sort((a, b) => (a.fields.naechste_pruefung ?? '').localeCompare(b.fields.naechste_pruefung ?? '')),
    [aktiveRegeln, todayKey, clock],
  );
  const hypothesen = useMemo(
    () => enrichedRegeln.filter(r => lookupKey(r.fields.verlaesslichkeitsgrad) === 'hypothese'
      && !['zurueckgezogen'].includes(lookupKey(r.fields.status) ?? '')),
    [enrichedRegeln],
  );
  const offeneAnnahmen = useMemo(
    () => enrichedAnnahmen
      .filter(a => lookupKey(a.fields.pruefstatus) === 'offen' || !a.fields.pruefstatus)
      .sort((a, b) => (REL_ORDER[lookupKey(a.fields.verlaesslichkeit) ?? ''] ?? 3) - (REL_ORDER[lookupKey(b.fields.verlaesslichkeit) ?? ''] ?? 3)),
    [enrichedAnnahmen],
  );
  const geprueft = annahmen.length - offeneAnnahmen.length;

  const vorgangStats = useMemo(() => {
    const m = new Map<string, { offen: number; regeln: number; entscheidungen: number }>();
    const get = (id: string) => { let s = m.get(id); if (!s) { s = { offen: 0, regeln: 0, entscheidungen: 0 }; m.set(id, s); } return s; };
    const idOf = (url?: string) => url?.match(/([a-f0-9]{24})$/i)?.[1];
    offeneAnnahmen.forEach(a => { const id = idOf(a.fields.vorgang); if (id) get(id).offen++; });
    regeln.forEach(r => { const id = idOf(r.fields.vorgang); if (id) get(id).regeln++; });
    entscheidungenUndLoesungswege.forEach(e => { const id = idOf(e.fields.vorgang); if (id) get(id).entscheidungen++; });
    return m;
  }, [offeneAnnahmen, regeln, entscheidungenUndLoesungswege]);

  const ohneUebergabe = useMemo(
    () => vorgaenge.filter(v => lookupKey(v.fields.status) === 'abgeschlossen' && !v.fields.uebergabehinweise?.trim()),
    [vorgaenge],
  );
  const ohneUebergabeIds = useMemo(() => new Set(ohneUebergabe.map(v => v.record_id)), [ohneUebergabe]);

  const columns = (LOOKUP_OPTIONS['vorgaenge']?.['status'] ?? []).map(o => ({ key: o.key, label: o.label })) as KanbanColumn[];
  const order = ['laufend', 'geplant', 'abgeschlossen', 'archiviert'];
  columns.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

  const cards: KanbanCard[] = vorgaenge
    .filter(v => filter === 'all'
      || (filter === 'offen' && (vorgangStats.get(v.record_id)?.offen ?? 0) > 0)
      || (filter === 'uebergabe' && ohneUebergabeIds.has(v.record_id)))
    .map(v => {
      const st = vorgangStats.get(v.record_id);
      const owner = [v.fields.verantwortlich_vorname, v.fields.verantwortlich_nachname].filter(Boolean).join(' ');
      const fehltUebergabe = ohneUebergabeIds.has(v.record_id);
      const tone: KanbanTone = fehltUebergabe ? 'warning' : (st?.offen ?? 0) > 0 ? 'primary' : 'default';
      const parts = [
        owner || tx('Ohne Verantwortliche'),
        st?.offen ? tx`${st.offen} offene Annahmen` : '',
        st?.regeln ? tx`${st.regeln} Regeln` : '',
        fehltUebergabe ? tx('Übergabehinweise fehlen') : '',
      ].filter(Boolean);
      return { id: `vorgang:${v.record_id}`, column: lookupKey(v.fields.status) ?? 'laufend', title: v.fields.titel ?? tx('Ohne Titel'), subtitle: parts.join(' · '), tone };
    });

  const moveCard = (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const rec = vorgaenge.find(v => v.record_id === rid);
    if (!rid || !rec) return;
    const prev = rec.fields.status;
    if (newColumn === 'abgeschlossen' && !rec.fields.uebergabehinweise?.trim()) {
      // allowed, but warn via toast after the write
    }
    setVorgaenge(list => list.map(v => v.record_id === rid ? { ...v, fields: { ...v.fields, status: lookupOption('vorgaenge', 'status', newColumn) } } : v));
    LivingAppsService.updateVorgaengeEntry(rid, { status: newColumn }).catch(() => fetchAll());
    undoToast(tx`${rec.fields.titel ?? ''} verschoben`, () => {
      setVorgaenge(list => list.map(v => v.record_id === rid ? { ...v, fields: { ...v.fields, status: prev } } : v));
      LivingAppsService.updateVorgaengeEntry(rid, { status: prev?.key ?? 'laufend' }).catch(() => fetchAll());
    });
  };

  const openByCard = (card: KanbanCard) => {
    const rec = vorgaenge.find(v => v.record_id === card.id.split(':')[1]);
    if (rec) crud.vorgaenge.openDetail(rec);
  };

  // ── context line ──
  const laufend = vorgaenge.filter(v => lookupKey(v.fields.status) === 'laufend');
  const contextLine = (() => {
    if (vorgaenge.length === 0) return tx('Lege deinen ersten Vorgang an, damit Wissen nicht verloren geht.');
    if (faelligeRegeln.length > 0) return tx`Die Regeln ${namen(faelligeRegeln.map(r => r.fields.titel ?? ''), 2)} warten auf ihre Überprüfung.`;
    if (offeneAnnahmen.length > 0) return tx`Offen zur Prüfung: ${namen(offeneAnnahmen.map(a => a.fields.aussage?.slice(0, 40) ?? ''), 2)}.`;
    if (laufend.length > 0) return tx`Laufende Vorgänge: ${namen(laufend.map(v => v.fields.titel ?? ''), 3)}.`;
    return tx('Das Gedächtnis ist aktuell — keine offenen Prüfungen.');
  })();

  const relWord = (key?: string, label?: string) => (
    <span className={`font-medium ${REL_CLASS[key ?? ''] ?? 'text-muted-foreground'}`}>{label ?? '—'}</span>
  );

  const toggle = (f: Filter) => setFilter(cur => (cur === f ? 'all' : f));

  const hero = faelligeRegeln.length > 0 ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{ label: tx('Als geprüft markieren'), onClick: () => markGeprueft(faelligeRegeln[0]) }}
    >
      <b>{namen(faelligeRegeln.map(r => r.fields.titel ?? ''), 3)}</b>{' '}
      {faelligeRegeln.length === 1 ? tx('ist überfällig zur Überprüfung') : tx('sind überfällig zur Überprüfung')}
      {' — '}{tx('fällig war')} {formatDate(faelligeRegeln[0].fields.naechste_pruefung)}.
    </HeroBanner>
  ) : null;

  const empty = vorgaenge.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground mt-1">{contextLine}</p>
        </div>
        {crud.vorgaenge.canWrite && (
          <button
            type="button"
            onClick={() => crud.vorgaenge.openCreate({ status: 'laufend' })}
            className="inline-flex items-center gap-2 min-h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <IconPlus size={16} className="shrink-0" />
            {tx('Neuer Vorgang')}
          </button>
        )}
      </header>

      {empty ? (
        <div className="rounded-[27px] bg-card shadow-sm p-8 flex flex-col items-center text-center gap-3 overflow-hidden">
          <IconBulb size={48} className="text-muted-foreground" stroke={1.5} />
          <p className="text-sm text-muted-foreground max-w-md">
            {tx('Hier wächst das Wissen deiner Organisation. Starte mit dem ersten Vorgang und halte Anforderungen, Entscheidungen und Annahmen fest.')}
          </p>
          {crud.vorgaenge.canWrite && (
            <button
              type="button"
              onClick={() => crud.vorgaenge.openCreate({ status: 'laufend' })}
              className="inline-flex items-center gap-2 min-h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {tx('Ersten Vorgang anlegen')}
            </button>
          )}
        </div>
      ) : (
        <DashboardGrid
          variant="wide"
          hero={hero}
          kpis={
            <StatStrip>
              <StatStripItem
                title={tx('Offene Annahmen')}
                value={offeneAnnahmen.length}
                icon={<IconHelpCircle size={16} className="text-muted-foreground" />}
                tone={offeneAnnahmen.length > 0 ? 'warning' : 'default'}
                onClick={() => toggle('offen')}
                active={filter === 'offen'}
              />
              <StatStripItem
                title={tx('Abgeschlossen ohne Übergabe')}
                value={ohneUebergabe.length}
                icon={<IconRepeat size={16} className="text-muted-foreground" />}
                tone={ohneUebergabe.length > 0 ? 'warning' : 'default'}
                onClick={() => toggle('uebergabe')}
                active={filter === 'uebergabe'}
              />
              <StatStripItem
                title={tx('Annahmen geprüft')}
                value={`${geprueft} / ${annahmen.length}`}
                icon={<IconGavel size={16} className="text-muted-foreground" />}
                tone={annahmen.length > 0 && geprueft === annahmen.length ? 'success' : 'default'}
              />
            </StatStrip>
          }
          primary={
            <KanbanWidget
              cards={cards}
              columns={columns}
              defaultCollapsed={['archiviert']}
              onCardClick={openByCard}
              onCardMove={crud.vorgaenge.canWrite ? moveCard : undefined}
              onAddCard={crud.vorgaenge.canWrite ? (column) => crud.vorgaenge.openCreate({ status: column }) : undefined}
            />
          }
          aside={
            <>
              <WorkList
                title={tx('Offene Annahmen')}
                icon={<IconHelpCircle size={16} />}
                items={offeneAnnahmen.map(a => ({
                  id: a.record_id,
                  title: a.fields.aussage ?? '—',
                  secondLine: (
                    <>
                      {relWord(lookupKey(a.fields.verlaesslichkeit), a.fields.verlaesslichkeit?.label)}
                      <span className="text-muted-foreground"> · {a.vorgangName}</span>
                    </>
                  ),
                  action: crud.annahmen.canWrite ? { label: tx('Bestätigen'), onClick: () => setPruefung(a, 'bestaetigt') } : undefined,
                }))}
                onItemClick={id => { const r = annahmen.find(x => x.record_id === id); if (r) crud.annahmen.openDetail(r); }}
                empty={{ text: tx('Alle Annahmen sind geprüft.') }}
              />
              <WorkList
                title={tx('Regeln: Prüfung in 30 Tagen')}
                icon={<IconRepeat size={16} />}
                items={baldRegeln.map(r => ({
                  id: r.record_id,
                  title: r.fields.titel ?? '—',
                  secondLine: (
                    <>
                      {relWord(lookupKey(r.fields.verlaesslichkeitsgrad), r.fields.verlaesslichkeitsgrad?.label)}
                      <span className="text-muted-foreground"> · {formatDate(r.fields.naechste_pruefung)}</span>
                    </>
                  ),
                  action: crud.regeln.canWrite ? { label: tx('Geprüft'), onClick: () => markGeprueft(r) } : undefined,
                }))}
                onItemClick={id => { const r = regeln.find(x => x.record_id === id); if (r) crud.regeln.openDetail(r); }}
                empty={{ text: tx('Keine Überprüfung in den nächsten 30 Tagen fällig.') }}
              />
              <WorkList
                title={tx('Hypothesen (noch nicht erprobt)')}
                icon={<IconBulb size={16} />}
                items={hypothesen.map(r => ({
                  id: r.record_id,
                  title: r.fields.titel ?? '—',
                  secondLine: (
                    <>
                      {relWord('hypothese', r.fields.verlaesslichkeitsgrad?.label)}
                      <span className="text-muted-foreground"> · {r.vorgangName || appLabel('regeln')}</span>
                    </>
                  ),
                  action: crud.regeln.canWrite ? { label: tx('Erprobt'), onClick: () => promoteRegel(r) } : undefined,
                }))}
                onItemClick={id => { const r = regeln.find(x => x.record_id === id); if (r) crud.regeln.openDetail(r); }}
                empty={{ text: tx('Keine Regel ist nur eine Hypothese.') }}
              />
              <WorkList
                title={appLabel('entscheidungen_und_loesungswege')}
                icon={<IconGavel size={16} />}
                items={[...enrichedEntscheidungen]
                  .sort((a, b) => (b.fields.entscheidungsdatum ?? '').localeCompare(a.fields.entscheidungsdatum ?? ''))
                  .map(e => {
                    const g = lookupKey(e.fields.gueltigkeit);
                    return {
                      id: e.record_id,
                      title: e.fields.titel ?? '—',
                      secondLine: (
                        <>
                          <span className={`font-medium ${g === 'gueltig' ? 'text-emerald-600' : g ? 'text-rose-600' : 'text-muted-foreground'}`}>
                            {e.fields.gueltigkeit?.label ?? '—'}
                          </span>
                          <span className="text-muted-foreground"> · {e.vorgangName} · {formatDate(e.fields.entscheidungsdatum)}</span>
                        </>
                      ),
                    };
                  })}
                onItemClick={id => { const r = entscheidungenUndLoesungswege.find(x => x.record_id === id); if (r) crud.entscheidungenUndLoesungswege.openDetail(r); }}
                empty={crud.entscheidungenUndLoesungswege.canWrite ? { text: tx('Noch keine Entscheidung dokumentiert.'), action: { label: tx('Entscheidung erfassen'), onClick: () => crud.entscheidungenUndLoesungswege.openCreate({ gueltigkeit: 'gueltig' }) } } : { text: tx('Noch keine Entscheidung dokumentiert.') }}
              />
            </>
          }
        />
      )}
      {crud.surfaces}
    </div>
  );
}
