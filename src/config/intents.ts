/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconFolderPlus, IconGavel, IconFlag, IconChecklist, IconRulerMeasure, IconArchive } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/vorgang-anlegen', label: { de: 'Vorgang anlegen', en: 'Create case' }, icon: IconFolderPlus, description: { de: 'Neuen Vorgang mit Verantwortlichen, Zeitraum und eingesetzten Werkzeugen erfassen und direkt erste Anforderungen dazu festhalten.', en: 'Record a new process with owners, time period and tools used, and directly capture initial requirements for it.' } },
  { path: '/intents/entscheidung-dokumentieren', label: { de: 'Entscheidung dokumentieren', en: 'Document decision' }, icon: IconGavel, description: { de: 'Eine Entscheidung mit Begründung, Alternativen und Lösungsweg zu einem Vorgang und ggf. einer Anforderung festhalten.', en: 'Record a decision with rationale, alternatives and solution path for a process and, if applicable, a requirement.' } },
  { path: '/intents/ergebnis-festhalten', label: { de: 'Ergebnis oder Grenze festhalten', en: 'Record result or limit' }, icon: IconFlag, description: { de: 'Ein beobachtetes Ergebnis oder eine erkannte Grenze zu einer Entscheidung erfassen, mit Verlässlichkeit.', en: 'Record an observed result or identified limitation for a decision, with reliability.' } },
  { path: '/intents/annahme-pruefen', label: { de: 'Annahme prüfen', en: 'Review assumption' }, icon: IconChecklist, description: { de: 'Eine offene Annahme bestätigen oder widerlegen, mit Prüfergebnis und stützendem Ergebnis.', en: 'Confirm or refute an open assumption, with test result and supporting result.' } },
  { path: '/intents/regel-ableiten', label: { de: 'Regel ableiten', en: 'Derive rule' }, icon: IconRulerMeasure, description: { de: 'Aus einer Entscheidung, einem Ergebnis oder einer bestätigten Annahme eine Regel als Entwurf formulieren.', en: 'Draft a rule from a decision, a result or a confirmed assumption.' } },
  { path: '/intents/vorgang-abschliessen', label: { de: 'Vorgang abschließen und übergeben', en: 'Close and hand over case' }, icon: IconArchive, description: { de: 'Einen Vorgang mit Enddatum und Übergabehinweisen abschließen, damit das Wissen bei Wechsel erhalten bleibt.', en: 'Close a process with an end date and handover notes so that knowledge is preserved when people change.' } },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = null;
export const PENDING_MAX_MINUTES = 30;
