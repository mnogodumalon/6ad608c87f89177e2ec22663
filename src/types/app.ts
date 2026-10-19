import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Vorgaenge {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    beschreibung?: string;
    bereich?: string;
    verantwortlich_vorname?: string;
    verantwortlich_nachname?: string;
    status?: LookupValue;
    startdatum?: string; // Format: YYYY-MM-DD oder ISO String
    enddatum?: string; // Format: YYYY-MM-DD oder ISO String
    werkzeuge?: string;
    uebergabehinweise?: string;
  };
}

export interface AnforderungenUndRandbedingungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    art?: LookupValue;
    titel?: string;
    beschreibung?: string;
    quelle?: string;
    prioritaet?: LookupValue;
    verlaesslichkeit?: LookupValue;
    erfassungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface EntscheidungenUndLoesungswege {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    anforderung?: RecordUrl; // applookup -> URL zu 'AnforderungenUndRandbedingungen' Record
    titel?: string;
    entscheidungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    entscheider_vorname?: string;
    entscheider_nachname?: string;
    begruendung?: string;
    alternativen?: string;
    loesungsweg?: string;
    werkzeug?: string;
    gueltigkeit?: LookupValue;
  };
}

export interface ErgebnisseUndGrenzen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'EntscheidungenUndLoesungswege' Record
    art?: LookupValue;
    titel?: string;
    beschreibung?: string;
    beobachtungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    bewertung?: LookupValue;
    verlaesslichkeit?: LookupValue;
    auswirkung?: string;
  };
}

export interface Annahmen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    aussage?: string;
    begruendung?: string;
    verlaesslichkeit?: LookupValue;
    pruefstatus?: LookupValue;
    pruefdatum?: string; // Format: YYYY-MM-DD oder ISO String
    pruefergebnis?: string;
    stuetzendes_ergebnis?: RecordUrl; // applookup -> URL zu 'ErgebnisseUndGrenzen' Record
  };
}

export interface Regeln {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    titel?: string;
    regeltext?: string;
    geltungsbereich?: string;
    vorgang?: RecordUrl; // applookup -> URL zu 'Vorgaenge' Record
    entscheidung?: RecordUrl; // applookup -> URL zu 'EntscheidungenUndLoesungswege' Record
    ergebnis?: RecordUrl; // applookup -> URL zu 'ErgebnisseUndGrenzen' Record
    annahme?: RecordUrl; // applookup -> URL zu 'Annahmen' Record
    verlaesslichkeitsgrad?: LookupValue;
    status?: LookupValue;
    gueltig_ab?: string; // Format: YYYY-MM-DD oder ISO String
    naechste_pruefung?: string; // Format: YYYY-MM-DD oder ISO String
    ki_hinweis?: string;
  };
}

export const APP_IDS = {
  VORGAENGE: '6ad6089f062265487455a269',
  ANFORDERUNGEN_UND_RANDBEDINGUNGEN: '6ad608a567052c6bd2ec4445',
  ENTSCHEIDUNGEN_UND_LOESUNGSWEGE: '6ad608a7bc1bd803e82e680e',
  ERGEBNISSE_UND_GRENZEN: '6ad608a856aeb3d7ca75889e',
  ANNAHMEN: '6ad608a95bf6600981483018',
  REGELN: '6ad608aad19f81a2c8d038b9',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'vorgaenge': {
    status: [{ key: "laufend", get label() { return lookupLabel('vorgaenge', 'status', "laufend") ?? "Laufend"; } }, { key: "abgeschlossen", get label() { return lookupLabel('vorgaenge', 'status', "abgeschlossen") ?? "Abgeschlossen"; } }, { key: "archiviert", get label() { return lookupLabel('vorgaenge', 'status', "archiviert") ?? "Archiviert"; } }, { key: "geplant", get label() { return lookupLabel('vorgaenge', 'status', "geplant") ?? "Geplant"; } }],
  },
  'anforderungen_und_randbedingungen': {
    art: [{ key: "anforderung", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'art', "anforderung") ?? "Ursprüngliche Anforderung"; } }, { key: "randbedingung", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'art', "randbedingung") ?? "Tatsächliche Randbedingung"; } }],
    prioritaet: [{ key: "hoch", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'prioritaet', "hoch") ?? "Hoch"; } }, { key: "mittel", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'prioritaet', "mittel") ?? "Mittel"; } }, { key: "niedrig", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'prioritaet', "niedrig") ?? "Niedrig"; } }],
    verlaesslichkeit: [{ key: "gesichert", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'verlaesslichkeit', "gesichert") ?? "Gesichert"; } }, { key: "wahrscheinlich", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'verlaesslichkeit', "wahrscheinlich") ?? "Wahrscheinlich"; } }, { key: "vermutet", get label() { return lookupLabel('anforderungen_und_randbedingungen', 'verlaesslichkeit', "vermutet") ?? "Vermutet"; } }],
  },
  'entscheidungen_und_loesungswege': {
    gueltigkeit: [{ key: "ueberholt", get label() { return lookupLabel('entscheidungen_und_loesungswege', 'gueltigkeit', "ueberholt") ?? "Überholt"; } }, { key: "widerrufen", get label() { return lookupLabel('entscheidungen_und_loesungswege', 'gueltigkeit', "widerrufen") ?? "Widerrufen"; } }, { key: "gueltig", get label() { return lookupLabel('entscheidungen_und_loesungswege', 'gueltigkeit', "gueltig") ?? "Gültig"; } }],
  },
  'ergebnisse_und_grenzen': {
    art: [{ key: "ergebnis", get label() { return lookupLabel('ergebnisse_und_grenzen', 'art', "ergebnis") ?? "Beobachtetes Ergebnis"; } }, { key: "grenze", get label() { return lookupLabel('ergebnisse_und_grenzen', 'art', "grenze") ?? "Erkannte Grenze"; } }],
    bewertung: [{ key: "erfolgreich", get label() { return lookupLabel('ergebnisse_und_grenzen', 'bewertung', "erfolgreich") ?? "Erfolgreich"; } }, { key: "teilweise", get label() { return lookupLabel('ergebnisse_und_grenzen', 'bewertung', "teilweise") ?? "Teilweise erfolgreich"; } }, { key: "nicht_erfolgreich", get label() { return lookupLabel('ergebnisse_und_grenzen', 'bewertung', "nicht_erfolgreich") ?? "Nicht erfolgreich"; } }],
    verlaesslichkeit: [{ key: "gesichert", get label() { return lookupLabel('ergebnisse_und_grenzen', 'verlaesslichkeit', "gesichert") ?? "Gesichert"; } }, { key: "wahrscheinlich", get label() { return lookupLabel('ergebnisse_und_grenzen', 'verlaesslichkeit', "wahrscheinlich") ?? "Wahrscheinlich"; } }, { key: "vermutet", get label() { return lookupLabel('ergebnisse_und_grenzen', 'verlaesslichkeit', "vermutet") ?? "Vermutet"; } }],
  },
  'annahmen': {
    verlaesslichkeit: [{ key: "gesichert", get label() { return lookupLabel('annahmen', 'verlaesslichkeit', "gesichert") ?? "Gesichert"; } }, { key: "wahrscheinlich", get label() { return lookupLabel('annahmen', 'verlaesslichkeit', "wahrscheinlich") ?? "Wahrscheinlich"; } }, { key: "vermutet", get label() { return lookupLabel('annahmen', 'verlaesslichkeit', "vermutet") ?? "Vermutet"; } }],
    pruefstatus: [{ key: "offen", get label() { return lookupLabel('annahmen', 'pruefstatus', "offen") ?? "Offen"; } }, { key: "bestaetigt", get label() { return lookupLabel('annahmen', 'pruefstatus', "bestaetigt") ?? "Bestätigt"; } }, { key: "widerlegt", get label() { return lookupLabel('annahmen', 'pruefstatus', "widerlegt") ?? "Widerlegt"; } }],
  },
  'regeln': {
    verlaesslichkeitsgrad: [{ key: "hypothese", get label() { return lookupLabel('regeln', 'verlaesslichkeitsgrad', "hypothese") ?? "Hypothese"; } }, { key: "erprobt", get label() { return lookupLabel('regeln', 'verlaesslichkeitsgrad', "erprobt") ?? "Erprobt"; } }, { key: "bestaetigt", get label() { return lookupLabel('regeln', 'verlaesslichkeitsgrad', "bestaetigt") ?? "Bestätigt"; } }],
    status: [{ key: "entwurf", get label() { return lookupLabel('regeln', 'status', "entwurf") ?? "Entwurf"; } }, { key: "gueltig", get label() { return lookupLabel('regeln', 'status', "gueltig") ?? "Gültig"; } }, { key: "ausgesetzt", get label() { return lookupLabel('regeln', 'status', "ausgesetzt") ?? "Ausgesetzt"; } }, { key: "zurueckgezogen", get label() { return lookupLabel('regeln', 'status', "zurueckgezogen") ?? "Zurückgezogen"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'vorgaenge': {
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'bereich': 'string/text',
    'verantwortlich_vorname': 'string/text',
    'verantwortlich_nachname': 'string/text',
    'status': 'lookup/radio',
    'startdatum': 'date/date',
    'enddatum': 'date/date',
    'werkzeuge': 'string/textarea',
    'uebergabehinweise': 'string/textarea',
  },
  'anforderungen_und_randbedingungen': {
    'vorgang': 'applookup/select',
    'art': 'lookup/radio',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'quelle': 'string/text',
    'prioritaet': 'lookup/select',
    'verlaesslichkeit': 'lookup/select',
    'erfassungsdatum': 'date/date',
  },
  'entscheidungen_und_loesungswege': {
    'vorgang': 'applookup/select',
    'anforderung': 'applookup/select',
    'titel': 'string/text',
    'entscheidungsdatum': 'date/date',
    'entscheider_vorname': 'string/text',
    'entscheider_nachname': 'string/text',
    'begruendung': 'string/textarea',
    'alternativen': 'string/textarea',
    'loesungsweg': 'string/textarea',
    'werkzeug': 'string/text',
    'gueltigkeit': 'lookup/radio',
  },
  'ergebnisse_und_grenzen': {
    'vorgang': 'applookup/select',
    'entscheidung': 'applookup/select',
    'art': 'lookup/radio',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'beobachtungsdatum': 'date/date',
    'bewertung': 'lookup/select',
    'verlaesslichkeit': 'lookup/select',
    'auswirkung': 'string/textarea',
  },
  'annahmen': {
    'vorgang': 'applookup/select',
    'aussage': 'string/textarea',
    'begruendung': 'string/textarea',
    'verlaesslichkeit': 'lookup/select',
    'pruefstatus': 'lookup/radio',
    'pruefdatum': 'date/date',
    'pruefergebnis': 'string/textarea',
    'stuetzendes_ergebnis': 'applookup/select',
  },
  'regeln': {
    'titel': 'string/text',
    'regeltext': 'string/textarea',
    'geltungsbereich': 'string/text',
    'vorgang': 'applookup/select',
    'entscheidung': 'applookup/select',
    'ergebnis': 'applookup/select',
    'annahme': 'applookup/select',
    'verlaesslichkeitsgrad': 'lookup/select',
    'status': 'lookup/radio',
    'gueltig_ab': 'date/date',
    'naechste_pruefung': 'date/date',
    'ki_hinweis': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
  'vorgaenge': [
    { field: 'vorgang', entity: 'anforderungen_und_randbedingungen' },
    { field: 'vorgang', entity: 'entscheidungen_und_loesungswege' },
    { field: 'vorgang', entity: 'ergebnisse_und_grenzen' },
    { field: 'vorgang', entity: 'annahmen' },
    { field: 'vorgang', entity: 'regeln' },
  ],
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateVorgaenge = StripLookup<Vorgaenge['fields']>;
export type CreateAnforderungenUndRandbedingungen = StripLookup<AnforderungenUndRandbedingungen['fields']>;
export type CreateEntscheidungenUndLoesungswege = StripLookup<EntscheidungenUndLoesungswege['fields']>;
export type CreateErgebnisseUndGrenzen = StripLookup<ErgebnisseUndGrenzen['fields']>;
export type CreateAnnahmen = StripLookup<Annahmen['fields']>;
export type CreateRegeln = StripLookup<Regeln['fields']>;