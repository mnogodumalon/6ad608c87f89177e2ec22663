/**
 * useVorgangAnlegenFlow — the plumbing of the flow « Vorgang anlegen », generated from the plan.
 *
 * Writes `vorgaenge`: asks `titel`, `bereich`, `werkzeuge`, `startdatum`, `beschreibung`, `verantwortlich_vorname`, `verantwortlich_nachname`; sets `status` itself.
Writes `anforderungen_und_randbedingungen` (only when the person fills it): asks `art`, `titel`, `quelle`, `prioritaet`, `beschreibung`, `verlaesslichkeit`; sets `erfassungsdatum` itself; links `vorgang` ← the created `vorgaenge`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 2)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useVorgangAnlegenFlow({
 *     steps: { titel: 1, bereich: 1, werkzeuge: 1, startdatum: 1, beschreibung: 1, verantwortlich_vorname: 1, verantwortlich_nachname: 1, art: 1, quelle: 1, prioritaet: 1, verlaesslichkeit: 1 },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <Bound form={flow.forms.vorgaenge} name="titel" />
 *     <Bound form={flow.forms.vorgaenge} name="bereich" />
 *     <Bound form={flow.forms.vorgaenge} name="werkzeuge" />
 *     <Bound form={flow.forms.vorgaenge} name="startdatum" />
 *     <Bound form={flow.forms.vorgaenge} name="beschreibung" />
 *     <Bound form={flow.forms.vorgaenge} name="verantwortlich_vorname" />
 *     <Bound form={flow.forms.vorgaenge} name="verantwortlich_nachname" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="art" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="titel" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="quelle" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="prioritaet" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="beschreibung" />
 *     <Bound form={flow.forms.anforderungen_und_randbedingungen} name="verlaesslichkeit" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
export type VorgangAnlegenFieldKey = 'art' | 'bereich' | 'beschreibung' | 'prioritaet' | 'quelle' | 'startdatum' | 'titel' | 'verantwortlich_nachname' | 'verantwortlich_vorname' | 'verlaesslichkeit' | 'werkzeuge';

export interface VorgangAnlegenForms {
  vorgaenge: StepForm<'vorgaenge'>;
  anforderungen_und_randbedingungen: StepForm<'anforderungen_und_randbedingungen'>;
}

// Alias so the option generics stay readable.
type Key = VorgangAnlegenFieldKey;

export interface VorgangAnlegenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
}

const DEFAULT_STEPS: Record<string, number> = {"art": 1, "bereich": 1, "beschreibung": 1, "prioritaet": 1, "quelle": 1, "startdatum": 1, "titel": 1, "verantwortlich_nachname": 1, "verantwortlich_vorname": 1, "verlaesslichkeit": 1, "werkzeuge": 1};
export const VORGANGANLEGEN_REVIEW_STEP = 2;

function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useVorgangAnlegenFlow(options: VorgangAnlegenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const vorgaenge = useStepForm('vorgaenge', {
    fields: ["titel", "bereich", "werkzeuge", "startdatum", "beschreibung", "verantwortlich_vorname", "verantwortlich_nachname"],
    steps: only(steps, ["titel", "bereich", "werkzeuge", "startdatum", "beschreibung", "verantwortlich_vorname", "verantwortlich_nachname"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["titel", "bereich", "werkzeuge", "startdatum", "beschreibung", "verantwortlich_vorname", "verantwortlich_nachname"]),
    messages: only(options.messages as Record<string, string> | undefined, ["titel", "bereich", "werkzeuge", "startdatum", "beschreibung", "verantwortlich_vorname", "verantwortlich_nachname"]),
  });
  const anforderungen_und_randbedingungen = useStepForm('anforderungen_und_randbedingungen', {
    fields: ["art", "titel", "quelle", "prioritaet", "beschreibung", "verlaesslichkeit"],
    steps: only(steps, ["art", "titel", "quelle", "prioritaet", "beschreibung", "verlaesslichkeit"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["art", "titel", "quelle", "prioritaet", "beschreibung", "verlaesslichkeit"]),
    messages: only(options.messages as Record<string, string> | undefined, ["art", "titel", "quelle", "prioritaet", "beschreibung", "verlaesslichkeit"]),
  });
  const forms: VorgangAnlegenForms = { vorgaenge, anforderungen_und_randbedingungen };
  const formList: StepForm[] = [vorgaenge, anforderungen_und_randbedingungen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:vorgang-anlegen:write:${entity}.${field}`,
  });
  const picks = {
  };

  const anforderungen_und_randbedingungenFilled = hasValues(anforderungen_und_randbedingungen);
  const plan: PlanStep[] = [
    {
      key: 'vorgaenge', entity: 'vorgaenge', form: vorgaenge, primary: true,
      values: (): FormValues => ({
        status: policyFixedValue('vorgaenge', 'status') ?? "geplant",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('vorgaenge', 'status', policyFixedValue('vorgaenge', 'status') ?? "geplant")],
    },
    ...(anforderungen_und_randbedingungenFilled ? [{
      key: 'anforderungen_und_randbedingungen', entity: 'anforderungen_und_randbedingungen', form: anforderungen_und_randbedingungen,      needs: ['vorgaenge'],
      link: { vorgang: 'vorgaenge' },

      values: (): FormValues => ({
        erfassungsdatum: policyFixedValue('anforderungen_und_randbedingungen', 'erfassungsdatum') ?? todayIso(),
      }),
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'vorgang-anlegen' });

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: VorgangAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: VorgangAnlegenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'vorgang-anlegen' as const,
    draftKey: 'vorgang-anlegen' as const,
    entity: 'vorgaenge' as const,
    form: vorgaenge,
    forms, formList, picks, submit, steps,    reviewStep: VORGANGANLEGEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type VorgangAnlegenFlow = ReturnType<typeof useVorgangAnlegenFlow>;
