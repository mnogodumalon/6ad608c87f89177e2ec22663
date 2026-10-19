// Auto-generated. Per-entity form-enhancements config for "Vorgänge".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "status", "bereich", {"row": ["verantwortlich_vorname", "verantwortlich_nachname"]}, {"row": ["startdatum", "enddatum"]}, "beschreibung", "werkzeuge", "uebergabehinweise"],
  defaults: {
    'status': { kind: 'lookup', key: 'laufend', label: 'Laufend' },
    'startdatum': { kind: 'today' },
  },
  computed: {
    '_vorgang_dauer_tage': { kind: 'dateDiff', from: 'startdatum', to: 'enddatum', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
