import type { AnforderungenUndRandbedingungen, Vorgaenge, EntscheidungenUndLoesungswege } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface AnforderungenUndRandbedingungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: AnforderungenUndRandbedingungen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** 1:N „Entscheidungen und Lösungswege" (anforderung): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndLoesungswegeList: EntscheidungenUndLoesungswege[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndLoesungswege-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndLoesungswege: (record: EntscheidungenUndLoesungswege) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndLoesungswege-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndLoesungswege?: () => void;
}

export function AnforderungenUndRandbedingungenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  entscheidungenUndLoesungswegeList,
  onOpenEntscheidungenUndLoesungswege,
  onAddEntscheidungenUndLoesungswege,
}: AnforderungenUndRandbedingungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'quelle')} value={record.fields.quelle} format="text" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'prioritaet')} value={record.fields.prioritaet} format="pill" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'verlaesslichkeit')} value={record.fields.verlaesslichkeit} format="pill" />
        <RecordField label={fieldLabel('anforderungen_und_randbedingungen', 'erfassungsdatum')} value={record.fields.erfassungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('anforderungen_und_randbedingungen', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.bereich, vorgangTarget?.fields.verantwortlich_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('entscheidungen_und_loesungswege')}
        items={entscheidungenUndLoesungswegeList.filter(r => extractRecordId(r.fields.anforderung) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('entscheidungen_und_loesungswege'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndLoesungswege}
        onAdd={onAddEntscheidungenUndLoesungswege}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANFORDERUNGEN_UND_RANDBEDINGUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('anforderungen_und_randbedingungen')} />
    </>
  );
}
