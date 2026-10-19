import type { Regeln, Vorgaenge, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Annahmen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface RegelnDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Regeln;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „EntscheidungenUndLoesungswege": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenUndLoesungswegeList: EntscheidungenUndLoesungswege[];
  /** Klick auf die EntscheidungenUndLoesungswege-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungenUndLoesungswege?: (record: EntscheidungenUndLoesungswege) => void;
  /** N:1-Ziel „ErgebnisseUndGrenzen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  ergebnisseUndGrenzenList: ErgebnisseUndGrenzen[];
  /** Klick auf die ErgebnisseUndGrenzen-Relation → overlay.push auf dessen Detail. */
  onOpenErgebnisseUndGrenzen?: (record: ErgebnisseUndGrenzen) => void;
  /** N:1-Ziel „Annahmen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  annahmenList: Annahmen[];
  /** Klick auf die Annahmen-Relation → overlay.push auf dessen Detail. */
  onOpenAnnahmen?: (record: Annahmen) => void;
}

export function RegelnDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  entscheidungenUndLoesungswegeList,
  onOpenEntscheidungenUndLoesungswege,
  ergebnisseUndGrenzenList,
  onOpenErgebnisseUndGrenzen,
  annahmenList,
  onOpenAnnahmen,
}: RegelnDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const entscheidungTarget = entscheidungenUndLoesungswegeList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  const ergebnisTarget = ergebnisseUndGrenzenList.find(r => r.record_id === extractRecordId(record.fields.ergebnis));
  const annahmeTarget = annahmenList.find(r => r.record_id === extractRecordId(record.fields.annahme));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regeln', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('regeln', 'regeltext')} value={record.fields.regeltext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln', 'geltungsbereich')} value={record.fields.geltungsbereich} format="text" />
        <RecordField label={fieldLabel('regeln', 'verlaesslichkeitsgrad')} value={record.fields.verlaesslichkeitsgrad} format="pill" />
        <RecordField label={fieldLabel('regeln', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('regeln', 'gueltig_ab')} value={record.fields.gueltig_ab} format="date" />
        <RecordField label={fieldLabel('regeln', 'naechste_pruefung')} value={record.fields.naechste_pruefung} format="date" />
        <RecordField label={fieldLabel('regeln', 'ki_hinweis')} value={record.fields.ki_hinweis} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('regeln', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.bereich, vorgangTarget?.fields.verantwortlich_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regeln', 'entscheidung')}
          name={entscheidungTarget?.fields.titel ?? '—'}
          meta={[entscheidungTarget?.fields.entscheider_vorname, entscheidungTarget?.fields.entscheider_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungenUndLoesungswege ? () => onOpenEntscheidungenUndLoesungswege!(entscheidungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regeln', 'ergebnis')}
          name={ergebnisTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={ergebnisTarget && onOpenErgebnisseUndGrenzen ? () => onOpenErgebnisseUndGrenzen!(ergebnisTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('regeln', 'annahme')}
          name={annahmeTarget?.fields.aussage ?? '—'}
          meta={undefined}
          onClick={annahmeTarget && onOpenAnnahmen ? () => onOpenAnnahmen!(annahmeTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.REGELN} recordId={record.record_id} readOnly={!perms.canWrite('regeln')} />
    </>
  );
}
