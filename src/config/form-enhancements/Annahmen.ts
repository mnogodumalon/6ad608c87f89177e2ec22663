// Auto-generated. Per-entity form-enhancements config for "Annahmen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorgang", "aussage", {"row": ["verlaesslichkeit", "pruefstatus"], "cols": "1fr 1fr"}, "pruefdatum", "stuetzendes_ergebnis", "begruendung", "pruefergebnis"],
  defaults: {
    'pruefstatus': { kind: 'lookup', key: 'offen', label: 'Offen' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
