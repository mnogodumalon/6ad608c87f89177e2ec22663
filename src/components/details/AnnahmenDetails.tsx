import type { Annahmen, Vorgaenge, ErgebnisseUndGrenzen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface AnnahmenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Annahmen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „ErgebnisseUndGrenzen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  ergebnisseUndGrenzenList: ErgebnisseUndGrenzen[];
  /** Klick auf die ErgebnisseUndGrenzen-Relation → overlay.push auf dessen Detail. */
  onOpenErgebnisseUndGrenzen?: (record: ErgebnisseUndGrenzen) => void;
  /** 1:N „Regeln" (annahme): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function AnnahmenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  ergebnisseUndGrenzenList,
  onOpenErgebnisseUndGrenzen,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: AnnahmenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const stuetzendes_ergebnisTarget = ergebnisseUndGrenzenList.find(r => r.record_id === extractRecordId(record.fields.stuetzendes_ergebnis));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('annahmen', 'aussage')} value={record.fields.aussage} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('annahmen', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('annahmen', 'verlaesslichkeit')} value={record.fields.verlaesslichkeit} format="pill" />
        <RecordField label={fieldLabel('annahmen', 'pruefstatus')} value={record.fields.pruefstatus} format="pill" />
        <RecordField label={fieldLabel('annahmen', 'pruefdatum')} value={record.fields.pruefdatum} format="date" />
        <RecordField label={fieldLabel('annahmen', 'pruefergebnis')} value={record.fields.pruefergebnis} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('annahmen', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.bereich, vorgangTarget?.fields.verantwortlich_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('annahmen', 'stuetzendes_ergebnis')}
          name={stuetzendes_ergebnisTarget?.fields.titel ?? '—'}
          meta={undefined}
          onClick={stuetzendes_ergebnisTarget && onOpenErgebnisseUndGrenzen ? () => onOpenErgebnisseUndGrenzen!(stuetzendes_ergebnisTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.annahme) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANNAHMEN} recordId={record.record_id} readOnly={!perms.canWrite('annahmen')} />
    </>
  );
}
