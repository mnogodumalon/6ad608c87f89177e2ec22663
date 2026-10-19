import type { Vorgaenge, AnforderungenUndRandbedingungen, EntscheidungenUndLoesungswege, ErgebnisseUndGrenzen, Annahmen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorgaengeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorgaenge;
  /** 1:N „Anforderungen und Randbedingungen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  anforderungenUndRandbedingungenList: AnforderungenUndRandbedingungen[];
  /** Zeilen-Klick → overlay.push auf das AnforderungenUndRandbedingungen-Detail (nie der Edit-Dialog). */
  onOpenAnforderungenUndRandbedingungen: (record: AnforderungenUndRandbedingungen) => void;
  /** Kontextuelles „+": öffnet den AnforderungenUndRandbedingungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnforderungenUndRandbedingungen?: () => void;
  /** 1:N „Entscheidungen und Lösungswege" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndLoesungswegeList: EntscheidungenUndLoesungswege[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndLoesungswege-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndLoesungswege: (record: EntscheidungenUndLoesungswege) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndLoesungswege-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndLoesungswege?: () => void;
  /** 1:N „Ergebnisse und Grenzen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  ergebnisseUndGrenzenList: ErgebnisseUndGrenzen[];
  /** Zeilen-Klick → overlay.push auf das ErgebnisseUndGrenzen-Detail (nie der Edit-Dialog). */
  onOpenErgebnisseUndGrenzen: (record: ErgebnisseUndGrenzen) => void;
  /** Kontextuelles „+": öffnet den ErgebnisseUndGrenzen-Dialog mit diesem Record vorgesetzt. */
  onAddErgebnisseUndGrenzen?: () => void;
  /** 1:N „Annahmen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  annahmenList: Annahmen[];
  /** Zeilen-Klick → overlay.push auf das Annahmen-Detail (nie der Edit-Dialog). */
  onOpenAnnahmen: (record: Annahmen) => void;
  /** Kontextuelles „+": öffnet den Annahmen-Dialog mit diesem Record vorgesetzt. */
  onAddAnnahmen?: () => void;
  /** 1:N „Regeln" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function VorgaengeDetails({
  record,
  anforderungenUndRandbedingungenList,
  onOpenAnforderungenUndRandbedingungen,
  onAddAnforderungenUndRandbedingungen,
  entscheidungenUndLoesungswegeList,
  onOpenEntscheidungenUndLoesungswege,
  onAddEntscheidungenUndLoesungswege,
  ergebnisseUndGrenzenList,
  onOpenErgebnisseUndGrenzen,
  onAddErgebnisseUndGrenzen,
  annahmenList,
  onOpenAnnahmen,
  onAddAnnahmen,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: VorgaengeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorgaenge', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'bereich')} value={record.fields.bereich} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'verantwortlich_vorname')} value={record.fields.verantwortlich_vorname} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'verantwortlich_nachname')} value={record.fields.verantwortlich_nachname} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('vorgaenge', 'startdatum')} value={record.fields.startdatum} format="date" />
        <RecordField label={fieldLabel('vorgaenge', 'enddatum')} value={record.fields.enddatum} format="date" />
        <RecordField label={fieldLabel('vorgaenge', 'werkzeuge')} value={record.fields.werkzeuge} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'uebergabehinweise')} value={record.fields.uebergabehinweise} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anforderungen_und_randbedingungen')}
        items={anforderungenUndRandbedingungenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('anforderungen_und_randbedingungen'), meta: r.fields.erfassungsdatum })}
        onOpen={onOpenAnforderungenUndRandbedingungen}
        onAdd={onAddAnforderungenUndRandbedingungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen_und_loesungswege')}
        items={entscheidungenUndLoesungswegeList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('entscheidungen_und_loesungswege'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndLoesungswege}
        onAdd={onAddEntscheidungenUndLoesungswege}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('ergebnisse_und_grenzen')}
        items={ergebnisseUndGrenzenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('ergebnisse_und_grenzen'), meta: r.fields.beobachtungsdatum })}
        onOpen={onOpenErgebnisseUndGrenzen}
        onAdd={onAddErgebnisseUndGrenzen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('annahmen')}
        items={annahmenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: appLabel('annahmen'), meta: r.fields.pruefdatum })}
        onOpen={onOpenAnnahmen}
        onAdd={onAddAnnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORGAENGE} recordId={record.record_id} readOnly={!perms.canWrite('vorgaenge')} />
    </>
  );
}
