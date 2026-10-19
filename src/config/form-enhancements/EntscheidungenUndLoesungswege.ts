// Auto-generated. Per-entity form-enhancements config for "Entscheidungen und Lösungswege".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "vorgang", "gueltigkeit", "anforderung", "entscheidungsdatum", {"row": ["entscheider_vorname", "entscheider_nachname"]}, "werkzeug", "begruendung", "alternativen", "loesungsweg"],
  defaults: {
    'entscheidungsdatum': { kind: 'today' },
    'gueltigkeit': { kind: 'lookup', key: 'gueltig', label: 'Gültig' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
