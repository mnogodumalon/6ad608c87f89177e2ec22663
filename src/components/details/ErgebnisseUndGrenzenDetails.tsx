import type { ErgebnisseUndGrenzen, Vorgaenge, EntscheidungenUndLoesungswege, Annahmen, Regeln } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface ErgebnisseUndGrenzenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: ErgebnisseUndGrenzen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „EntscheidungenUndLoesungswege": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  entscheidungenUndLoesungswegeList: EntscheidungenUndLoesungswege[];
  /** Klick auf die EntscheidungenUndLoesungswege-Relation → overlay.push auf dessen Detail. */
  onOpenEntscheidungenUndLoesungswege?: (record: EntscheidungenUndLoesungswege) => void;
  /** 1:N „Annahmen" (stuetzendes_ergebnis): VOLLE Liste — der Block filtert auf diesen Record. */
  annahmenList: Annahmen[];
  /** Zeilen-Klick → overlay.push auf das Annahmen-Detail (nie der Edit-Dialog). */
  onOpenAnnahmen: (record: Annahmen) => void;
  /** Kontextuelles „+": öffnet den Annahmen-Dialog mit diesem Record vorgesetzt. */
  onAddAnnahmen?: () => void;
  /** 1:N „Regeln" (ergebnis): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnList: Regeln[];
  /** Zeilen-Klick → overlay.push auf das Regeln-Detail (nie der Edit-Dialog). */
  onOpenRegeln: (record: Regeln) => void;
  /** Kontextuelles „+": öffnet den Regeln-Dialog mit diesem Record vorgesetzt. */
  onAddRegeln?: () => void;
}

export function ErgebnisseUndGrenzenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  entscheidungenUndLoesungswegeList,
  onOpenEntscheidungenUndLoesungswege,
  annahmenList,
  onOpenAnnahmen,
  onAddAnnahmen,
  regelnList,
  onOpenRegeln,
  onAddRegeln,
}: ErgebnisseUndGrenzenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const entscheidungTarget = entscheidungenUndLoesungswegeList.find(r => r.record_id === extractRecordId(record.fields.entscheidung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'beobachtungsdatum')} value={record.fields.beobachtungsdatum} format="date" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'bewertung')} value={record.fields.bewertung} format="pill" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'verlaesslichkeit')} value={record.fields.verlaesslichkeit} format="pill" />
        <RecordField label={fieldLabel('ergebnisse_und_grenzen', 'auswirkung')} value={record.fields.auswirkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('ergebnisse_und_grenzen', 'vorgang')}
          name={vorgangTarget?.fields.titel ?? '—'}
          meta={[vorgangTarget?.fields.bereich, vorgangTarget?.fields.verantwortlich_vorname].filter(Boolean).join(' · ') || undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('ergebnisse_und_grenzen', 'entscheidung')}
          name={entscheidungTarget?.fields.titel ?? '—'}
          meta={[entscheidungTarget?.fields.entscheider_vorname, entscheidungTarget?.fields.entscheider_nachname].filter(Boolean).join(' · ') || undefined}
          onClick={entscheidungTarget && onOpenEntscheidungenUndLoesungswege ? () => onOpenEntscheidungenUndLoesungswege!(entscheidungTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('annahmen')}
        items={annahmenList.filter(r => extractRecordId(r.fields.stuetzendes_ergebnis) === record.record_id)}
        map={r => ({ name: appLabel('annahmen'), meta: r.fields.pruefdatum })}
        onOpen={onOpenAnnahmen}
        onAdd={onAddAnnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln')}
        items={regelnList.filter(r => extractRecordId(r.fields.ergebnis) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('regeln'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegeln}
        onAdd={onAddRegeln}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ERGEBNISSE_UND_GRENZEN} recordId={record.record_id} readOnly={!perms.canWrite('ergebnisse_und_grenzen')} />
    </>
  );
}
