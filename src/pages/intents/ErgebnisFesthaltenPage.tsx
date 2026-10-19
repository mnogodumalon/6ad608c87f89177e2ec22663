/**
 * Ergebnis oder Grenze festhalten — 3-Schritt-Wizard.
 * Steps: 1) Vorgang und zugehörige Entscheidung wählen → 2) Art, Titel, Bewertung und Auswirkung erfassen
 *        → 3) Verlässlichkeit angeben → Prüfen & anlegen.
 * Reads: vorgaenge, entscheidungen_und_loesungswege. Writes: ergebnisse_und_grenzen (via useErgebnisFesthaltenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useErgebnisFesthaltenFlow } from '@/lib/journey/flows/ErgebnisFesthalten';
import { tx } from '@/i18n';

export default function ErgebnisFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useErgebnisFesthaltenFlow({
    steps: { vorgang: 1, entscheidung: 1, art: 2, titel: 2, beschreibung: 2, bewertung: 2, auswirkung: 2, verlaesslichkeit: 3 },
    items: {
      vorgang: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'status')?.label }),
      entscheidung: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: ctx.ref('vorgang'),
        status: fieldLookup(r, 'gueltigkeit')?.label,
      }),
    },
  });
  const f = flow.forms.ergebnisse_und_grenzen;

  return (
    <IntentWizardShell
      title={tx('Ergebnis oder Grenze festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Ein beobachtetes Ergebnis oder eine erkannte Grenze mit Verlässlichkeit erfassen.'),
        needs: [tx('Den betroffenen Vorgang'), tx('Titel und Bewertung der Beobachtung')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Zu welchem Vorgang gehört die Beobachtung – und zu welcher Entscheidung?')}>
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.vorgang.select}
            {...flow.pick('vorgang')}
            searchPlaceholder={tx('Vorgang suchen …')}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">{tx('Zugehörige Entscheidung (optional)')}</p>
            <EntitySelectStep
              {...flow.picks.entscheidung.select}
              {...flow.pick('entscheidung')}
              searchPlaceholder={tx('Entscheidung suchen …')}
            />
          </div>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Beobachtung erfassen')} />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Beobachtung')}
        description={tx('Was wurde beobachtet und wie wirkt es sich aus?')}
        needs={['vorgang']}
      >
        <div className="space-y-4">
          <Bound form={f} name="art" />
          <Bound form={f} name="titel" />
          <Bound form={f} name="beschreibung" rows={3} />
          <Bound form={f} name="bewertung" allowClear />
          <Bound form={f} name="auswirkung" rows={3} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Verlässlichkeit')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Verlässlichkeit')} description={tx('Wie belastbar ist diese Beobachtung?')}>
        <div className="space-y-4">
          <Bound form={f} name="verlaesslichkeit" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Das Datum der Beobachtung ist heute und wird automatisch gesetzt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Annahme prüfen'), href: '#/intents/annahme-pruefen' },
            { label: tx('Regel ableiten'), href: '#/intents/regel-ableiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Das Ergebnis kann jetzt Annahmen stützen oder in eine Regel einfließen.')}
        />
      )}
    </IntentWizardShell>
  );
}
