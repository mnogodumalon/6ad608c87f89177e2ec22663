/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'vorgaenge' | 'anforderungen_und_randbedingungen' | 'entscheidungen_und_loesungswege' | 'ergebnisse_und_grenzen' | 'annahmen' | 'regeln';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "vorgaenge": "titel" | "beschreibung" | "bereich" | "verantwortlich_vorname" | "verantwortlich_nachname" | "werkzeuge" | "uebergabehinweise";
  "anforderungen_und_randbedingungen": "titel" | "beschreibung" | "quelle";
  "entscheidungen_und_loesungswege": "titel" | "entscheider_vorname" | "entscheider_nachname" | "begruendung" | "alternativen" | "loesungsweg" | "werkzeug";
  "ergebnisse_und_grenzen": "titel" | "beschreibung" | "auswirkung";
  "annahmen": "aussage" | "begruendung" | "pruefergebnis";
  "regeln": "titel" | "regeltext" | "geltungsbereich" | "ki_hinweis";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "vorgaenge": never;
  "anforderungen_und_randbedingungen": "vorgang";
  "entscheidungen_und_loesungswege": "vorgang" | "anforderung";
  "ergebnisse_und_grenzen": "vorgang" | "entscheidung";
  "annahmen": "vorgang" | "stuetzendes_ergebnis";
  "regeln": "vorgang" | "entscheidung" | "ergebnis" | "annahme";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "vorgaenge": {
    "key": "vorgaenge",
    "appId": "6ad6089f062265487455a269",
    "label": "Vorgänge",
    "pascal": "Vorgaenge",
    "single": "VorgaengeEntry"
  },
  "anforderungen_und_randbedingungen": {
    "key": "anforderungen_und_randbedingungen",
    "appId": "6ad608a567052c6bd2ec4445",
    "label": "Anforderungen und Randbedingungen",
    "pascal": "AnforderungenUndRandbedingungen",
    "single": "AnforderungenUndRandbedingungenEntry"
  },
  "entscheidungen_und_loesungswege": {
    "key": "entscheidungen_und_loesungswege",
    "appId": "6ad608a7bc1bd803e82e680e",
    "label": "Entscheidungen und Lösungswege",
    "pascal": "EntscheidungenUndLoesungswege",
    "single": "EntscheidungenUndLoesungswegeEntry"
  },
  "ergebnisse_und_grenzen": {
    "key": "ergebnisse_und_grenzen",
    "appId": "6ad608a856aeb3d7ca75889e",
    "label": "Ergebnisse und Grenzen",
    "pascal": "ErgebnisseUndGrenzen",
    "single": "ErgebnisseUndGrenzenEntry"
  },
  "annahmen": {
    "key": "annahmen",
    "appId": "6ad608a95bf6600981483018",
    "label": "Annahmen",
    "pascal": "Annahmen",
    "single": "AnnahmenEntry"
  },
  "regeln": {
    "key": "regeln",
    "appId": "6ad608aad19f81a2c8d038b9",
    "label": "Regeln",
    "pascal": "Regeln",
    "single": "RegelnEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "vorgaenge": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "bereich": {
      "key": "bereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Bereich oder Team",
      "writable": true,
      "maxLength": 4000
    },
    "verantwortlich_vorname": {
      "key": "verantwortlich_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Verantwortliche Person (Vorname)",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "verantwortlich_nachname": {
      "key": "verantwortlich_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Verantwortliche Person (Nachname)",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "laufend",
        "abgeschlossen",
        "archiviert",
        "geplant"
      ]
    },
    "startdatum": {
      "key": "startdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Startdatum",
      "writable": true
    },
    "enddatum": {
      "key": "enddatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Enddatum",
      "writable": true
    },
    "werkzeuge": {
      "key": "werkzeuge",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Eingesetzte Werkzeuge und KI-Modelle",
      "writable": true
    },
    "uebergabehinweise": {
      "key": "uebergabehinweise",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Übergabehinweise",
      "writable": true
    }
  },
  "anforderungen_und_randbedingungen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad6089f062265487455a269",
      "targetEntity": "vorgaenge"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "anforderung",
        "randbedingung"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "quelle": {
      "key": "quelle",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Quelle",
      "writable": true,
      "maxLength": 4000
    },
    "prioritaet": {
      "key": "prioritaet",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Priorität",
      "writable": true,
      "options": [
        "hoch",
        "mittel",
        "niedrig"
      ]
    },
    "verlaesslichkeit": {
      "key": "verlaesslichkeit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Verlässlichkeit",
      "writable": true,
      "options": [
        "gesichert",
        "wahrscheinlich",
        "vermutet"
      ]
    },
    "erfassungsdatum": {
      "key": "erfassungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Erfassungsdatum",
      "writable": true
    }
  },
  "entscheidungen_und_loesungswege": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad6089f062265487455a269",
      "targetEntity": "vorgaenge"
    },
    "anforderung": {
      "key": "anforderung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Bezug zu Anforderung oder Randbedingung",
      "writable": true,
      "targetAppId": "6ad608a567052c6bd2ec4445",
      "targetEntity": "anforderungen_und_randbedingungen"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel der Entscheidung",
      "writable": true,
      "maxLength": 4000
    },
    "entscheidungsdatum": {
      "key": "entscheidungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Entscheidungsdatum",
      "writable": true
    },
    "entscheider_vorname": {
      "key": "entscheider_vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Entscheider (Vorname)",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "entscheider_nachname": {
      "key": "entscheider_nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Entscheider (Nachname)",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "alternativen": {
      "key": "alternativen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Betrachtete Alternativen",
      "writable": true
    },
    "loesungsweg": {
      "key": "loesungsweg",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verwendeter Lösungsweg",
      "writable": true
    },
    "werkzeug": {
      "key": "werkzeug",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Eingesetztes Werkzeug oder Modell",
      "writable": true,
      "maxLength": 4000
    },
    "gueltigkeit": {
      "key": "gueltigkeit",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Gültigkeitsstatus",
      "writable": true,
      "options": [
        "ueberholt",
        "widerrufen",
        "gueltig"
      ]
    }
  },
  "ergebnisse_und_grenzen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad6089f062265487455a269",
      "targetEntity": "vorgaenge"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zugehörige Entscheidung",
      "writable": true,
      "targetAppId": "6ad608a7bc1bd803e82e680e",
      "targetEntity": "entscheidungen_und_loesungswege"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "ergebnis",
        "grenze"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "beobachtungsdatum": {
      "key": "beobachtungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Beobachtungsdatum",
      "writable": true
    },
    "bewertung": {
      "key": "bewertung",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Bewertung",
      "writable": true,
      "options": [
        "erfolgreich",
        "teilweise",
        "nicht_erfolgreich"
      ]
    },
    "verlaesslichkeit": {
      "key": "verlaesslichkeit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Verlässlichkeit",
      "writable": true,
      "options": [
        "gesichert",
        "wahrscheinlich",
        "vermutet"
      ]
    },
    "auswirkung": {
      "key": "auswirkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Auswirkung",
      "writable": true
    }
  },
  "annahmen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad6089f062265487455a269",
      "targetEntity": "vorgaenge"
    },
    "aussage": {
      "key": "aussage",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Aussage der Annahme",
      "writable": true
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "verlaesslichkeit": {
      "key": "verlaesslichkeit",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Verlässlichkeit",
      "writable": true,
      "options": [
        "gesichert",
        "wahrscheinlich",
        "vermutet"
      ]
    },
    "pruefstatus": {
      "key": "pruefstatus",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Prüfstatus",
      "writable": true,
      "options": [
        "offen",
        "bestaetigt",
        "widerlegt"
      ]
    },
    "pruefdatum": {
      "key": "pruefdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Prüfdatum",
      "writable": true
    },
    "pruefergebnis": {
      "key": "pruefergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Prüfergebnis",
      "writable": true
    },
    "stuetzendes_ergebnis": {
      "key": "stuetzendes_ergebnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Stützendes Ergebnis",
      "writable": true,
      "targetAppId": "6ad608a856aeb3d7ca75889e",
      "targetEntity": "ergebnisse_und_grenzen"
    }
  },
  "regeln": {
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "regeltext": {
      "key": "regeltext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Regeltext",
      "writable": true
    },
    "geltungsbereich": {
      "key": "geltungsbereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Geltungsbereich",
      "writable": true,
      "maxLength": 4000
    },
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Herkunft: Vorgang",
      "writable": true,
      "targetAppId": "6ad6089f062265487455a269",
      "targetEntity": "vorgaenge"
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgeleitet aus Entscheidung",
      "writable": true,
      "targetAppId": "6ad608a7bc1bd803e82e680e",
      "targetEntity": "entscheidungen_und_loesungswege"
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgeleitet aus Ergebnis",
      "writable": true,
      "targetAppId": "6ad608a856aeb3d7ca75889e",
      "targetEntity": "ergebnisse_und_grenzen"
    },
    "annahme": {
      "key": "annahme",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Abgeleitet aus Annahme",
      "writable": true,
      "targetAppId": "6ad608a95bf6600981483018",
      "targetEntity": "annahmen"
    },
    "verlaesslichkeitsgrad": {
      "key": "verlaesslichkeitsgrad",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Verlässlichkeitsgrad",
      "writable": true,
      "options": [
        "hypothese",
        "erprobt",
        "bestaetigt"
      ]
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "entwurf",
        "gueltig",
        "ausgesetzt",
        "zurueckgezogen"
      ]
    },
    "gueltig_ab": {
      "key": "gueltig_ab",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig ab",
      "writable": true
    },
    "naechste_pruefung": {
      "key": "naechste_pruefung",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Nächster Überprüfungstermin",
      "writable": true
    },
    "ki_hinweis": {
      "key": "ki_hinweis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Hinweis zur Nutzung durch die KI",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "vorgaenge": [
    {
      "kind": "range",
      "from": "startdatum",
      "to": "enddatum"
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    }
  ],
  "anforderungen_und_randbedingungen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "prioritaet",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "verlaesslichkeit",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    }
  ],
  "entscheidungen_und_loesungswege": [
    {
      "kind": "choice",
      "field": "gueltigkeit",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "anforderung",
      "targetEntity": "anforderungen_und_randbedingungen"
    }
  ],
  "ergebnisse_und_grenzen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "bewertung",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "verlaesslichkeit",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen_und_loesungswege"
    }
  ],
  "annahmen": [
    {
      "kind": "choice",
      "field": "verlaesslichkeit",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "pruefstatus",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "stuetzendes_ergebnis",
      "targetEntity": "ergebnisse_und_grenzen"
    }
  ],
  "regeln": [
    {
      "kind": "choice",
      "field": "verlaesslichkeitsgrad",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "entscheidung",
      "targetEntity": "entscheidungen_und_loesungswege"
    },
    {
      "kind": "record",
      "field": "ergebnis",
      "targetEntity": "ergebnisse_und_grenzen"
    },
    {
      "kind": "record",
      "field": "annahme",
      "targetEntity": "annahmen"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "vorgaenge": [
    "titel"
  ],
  "anforderungen_und_randbedingungen": [
    "titel"
  ],
  "entscheidungen_und_loesungswege": [
    "titel"
  ],
  "ergebnisse_und_grenzen": [
    "titel"
  ],
  "annahmen": [
    "aussage"
  ],
  "regeln": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
