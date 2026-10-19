/**
 * Annahme prüfen — 3-Schritt-Wizard.
 * Steps: 1) Offene Annahme wählen → 2) Optional stützendes Ergebnis wählen → 3) Prüfergebnis erfassen (bestätigen oder widerlegen) → Prüfen & speichern.
 * Reads: annahmen, ergebnisse_und_grenzen. Writes: annahmen (update; pruefdatum = heute).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useAnnahmePruefenFlow } from '@/lib/journey/flows/AnnahmePruefen';
import { tx } from '@/i18n';

export default function AnnahmePruefenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnnahmePruefenFlow({
    steps: { annahmen: 1, stuetzendes_ergebnis: 2, pruefstatus: 3, pruefergebnis: 3, verlaesslichkeit: 3 },
    items: {
      annahmen: (a, ctx) => ({
        id: a.id,
        title: fieldText(a, 'aussage'),
        subtitle: [ctx.ref('vorgang'), fieldLookup(a, 'verlaesslichkeit')?.label].filter(Boolean).join(' · '),
      }),
      stuetzendes_ergebnis: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [ctx.ref('vorgang'), fieldLookup(r, 'art')?.label, fieldLookup(r, 'verlaesslichkeit')?.label]
          .filter(Boolean)
          .join(' · '),
      }),
    },
  });
  const form = flow.forms.annahmen;

  return (
    <IntentWizardShell
      title={tx('Annahme prüfen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine offene Annahme bestätigen oder widerlegen.'),
        needs: [tx('Die zu prüfende Annahme'), tx('Dein Prüfergebnis')],
      }}
    >
      <WizardStep label={tx('Annahme')} description={tx('Welche offene Annahme prüfst du?')}>
        <EntitySelectStep
          {...flow.picks.annahmen.select}
          {...flow.pick('annahmen')}
          searchPlaceholder={tx('Aussage suchen …')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Stützendes Ergebnis')}
        description={tx('Optional: Welches Ergebnis stützt dein Prüfergebnis?')}
        needs={['annahmen']}
      >
        <EntitySelectStep
          {...flow.picks.stuetzendes_ergebnis.select}
          {...flow.pick('stuetzendes_ergebnis')}
          searchPlaceholder={tx('Titel suchen …')}
        />
        <StepNav
          onBack={() => setStep(1)}
          onNext={() => flow.validateStep(2)}
          nextStepLabel={tx('Prüfergebnis')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Prüfergebnis')}
        description={tx('Bestätigen oder widerlegen — und kurz begründen.')}
        needs={['annahmen']}
      >
        <div className="space-y-4">
          <Bound form={form} name="pruefstatus" />
          <Bound form={form} name="pruefergebnis" rows={4} />
          <Bound form={form} name="verlaesslichkeit" />
        </div>
        <StepNav
          onBack={() => setStep(2)}
          onNext={() => flow.validateStep(3)}
          nextStepLabel={tx('Prüfen')}
        />
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'pruefdatum', label: tx('Prüfdatum'), value: format(new Date(), 'dd.MM.yyyy') }]}
            whatHappensNext={tx('Die Annahme erhält Prüfstatus, Prüfergebnis und das heutige Prüfdatum.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Regel ableiten'), href: '#/intents/regel-ableiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Aus einer bestätigten Annahme kannst du jetzt eine Regel ableiten.')}
        />
      )}
    </IntentWizardShell>
  );
}
