import type { EntscheidungenUndLoesungswege, Vorgaenge, AnforderungenUndRandbedingungen, ErgebnisseUndGrenzen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface EntscheidungenUndLoesungswegeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: EntscheidungenUndLoesungswege;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „AnforderungenUndRandbedingungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  anforderungenUndRandbedingungenList: AnforderungenUndRandbedingungen[];
  /** Klick auf die AnforderungenUndRandbedingungen-Relation → overlay.push auf dessen Detail. */
  onOpenAnforderungenUndRandbedingungen?: (record: AnforderungenUndRandbedingungen) => void;
  /** 1:N „Ergebnisse und Grenzen" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  ergebnisseUndGrenzenList: ErgebnisseUndGrenzen[];
  /** Zeilen-Klick → overlay.push auf das ErgebnisseUndGrenzen-Detail (nie der Edit-Dialog). */
  onOpenErgebnisseUndGrenzen: (record: ErgebnisseUndGrenzen) => void;
  /** Kontextuelles „+": öffnet den ErgebnisseUndGrenzen-Dialog mit diesem Record vorgesetzt. */
  onAddErgebnisseUndGrenzen?: () => void;
  /** 1:N „Regeln" (entscheidung): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function EntscheidungenUndLoesungswegeDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  anforderungenUndRandbedingungenList,
  onOpenAnforderungenUndRandbedingungen,
  ergebnisseUndGrenzenList,
  onOpenErgebnisseUndGrenzen,
  onAddErgebnisseUndGrenzen,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: EntscheidungenUndLoesungswegeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const anforderungTarget = anforderungenUndRandbedingungenList.find(r => r.record_id === extractRecordId(record.fields.anforderung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'entscheidungsdatum')} value={record.fields.entscheidungsdatum} format="date" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'entscheider_vorname')} value={record.fields.entscheider_vorname} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'entscheider_nachname')} value={record.fields.entscheider_nachname} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'alternativen')} value={record.fields.alternativen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'loesungsweg')} value={record.fields.loesungsweg} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'werkzeug')} value={record.fields.werkzeug} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_loesungswege', 'gueltigkeit')} value={record.fields.gueltigkeit} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('entscheidungen_und_loesungswege', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.bereich, vorgangTarget?.fields.verantwortlich_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('entscheidungen_und_loesungswege', 'anforderung')}
          name={anforderungTarget?.fields.titel ?? '—'}
          meta={[anforderungTarget?.fields.quelle].filter(Boolean).join(' · ') || undefined}
          onClick={anforderungTarget && onOpenAnforderungenUndRandbedingungen ? () => onOpenAnforderungenUndRandbedingungen!(anforderungTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('ergebnisse_und_grenzen')}
        items={ergebnisseUndGrenzenList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('ergebnisse_und_grenzen'), meta: r.fields.beobachtungsdatum })}
        onOpen={onOpenErgebnisseUndGrenzen}
        onAdd={onAddErgebnisseUndGrenzen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.entscheidung) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ENTSCHEIDUNGEN_UND_LOESUNGSWEGE} recordId={record.record_id} readOnly={!perms.canWrite('entscheidungen_und_loesungswege')} />
    </>
  );
}
