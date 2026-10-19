// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "vorgang-anlegen": [
    "Legt an: anforderungen_und_randbedingungen, vorgaenge",
    "Automatisch: status (fester Wert „geplant“), erfassungsdatum (heutiges Datum, automatisch)"
  ],
  "entscheidung-dokumentieren": [
    "Legt an: entscheidungen_und_loesungswege",
    "Automatisch: entscheidungsdatum (heutiges Datum, automatisch), gueltigkeit (fester Wert „gueltig“)"
  ],
  "ergebnis-festhalten": [
    "Legt an: ergebnisse_und_grenzen",
    "Automatisch: beobachtungsdatum (heutiges Datum, automatisch)"
  ],
  "annahme-pruefen": [
    "Ändert: annahmen",
    "Automatisch: pruefdatum (heutiges Datum, automatisch)"
  ],
  "regel-ableiten": [
    "Legt an: regeln",
    "Automatisch: status (fester Wert „entwurf“)"
  ],
  "vorgang-abschliessen": [
    "Ändert: vorgaenge",
    "Automatisch: status (fester Wert „abgeschlossen“), enddatum (heutiges Datum, automatisch)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung ist das organisationale Gedächtnis: Zu jedem Vorgang (Projekt, Aufgabe) werden Anforderungen, Randbedingungen, Entscheidungen, Lösungswege, Ergebnisse, Grenzen, Annahmen und daraus abgeleitete Regeln festgehalten. Bei allem steht, wie verlässlich die Erkenntnis ist. So bleibt das Wissen erhalten, auch wenn Beschäftigte oder Werkzeuge wechseln, und die KI kann es nutzen und erweitern.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "vorgang-anlegen": [
    "anforderungen_und_randbedingungen",
    "vorgaenge"
  ],
  "entscheidung-dokumentieren": [
    "entscheidungen_und_loesungswege"
  ],
  "ergebnis-festhalten": [
    "ergebnisse_und_grenzen"
  ],
  "annahme-pruefen": [
    "annahmen"
  ],
  "regel-ableiten": [
    "regeln"
  ],
  "vorgang-abschliessen": [
    "vorgaenge"
  ]
};
