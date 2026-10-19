/**
 * Entscheidung dokumentieren — 3-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Optional Anforderung oder Randbedingung wählen → 3) Entscheidung erfassen → Prüfen & anlegen.
 * Reads: vorgaenge, anforderungen_und_randbedingungen. Writes: entscheidungen_und_loesungswege (via useEntscheidungDokumentierenFlow).
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
import { useEntscheidungDokumentierenFlow } from '@/lib/journey/flows/EntscheidungDokumentieren';
import { tx } from '@/i18n';

export default function EntscheidungDokumentierenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntscheidungDokumentierenFlow({
    steps: {
      vorgang: 1,
      anforderung: 2,
      titel: 3,
      entscheider_vorname: 3,
      entscheider_nachname: 3,
      begruendung: 3,
      alternativen: 3,
      loesungsweg: 3,
      werkzeug: 3,
    },
    items: {
      vorgang: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldText(r, 'bereich'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      anforderung: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [fieldLookup(r, 'art')?.label, fieldLookup(r, 'verlaesslichkeit')?.label, ctx.ref('vorgang')]
          .filter(Boolean)
          .join(' · '),
      }),
    },
  });
  const f = flow.forms.entscheidungen_und_loesungswege;

  return (
    <IntentWizardShell
      title={tx('Entscheidung dokumentieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Entscheidung samt Begründung nachvollziehbar festhalten.'),
        needs: [tx('Den zugehörigen Vorgang'), tx('Titel und Begründung der Entscheidung')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Zu welchem Vorgang gehört die Entscheidung?')}>
        <EntitySelectStep
          {...flow.picks.vorgang.select}
          {...flow.pick('vorgang')}
          searchPlaceholder={tx('Vorgang suchen …')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Anforderung')}
        description={tx('Falls die Entscheidung auf eine Anforderung oder Randbedingung antwortet, wähle sie aus. Sonst geh einfach weiter.')}
        needs={['vorgang']}
      >
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.anforderung.select}
            {...flow.pick('anforderung')}
            searchPlaceholder={tx('Anforderung suchen …')}
          />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => true}
            nextStepLabel={tx('Entscheidung erfassen')}
          />
        </div>
      </WizardStep>
      <WizardStep
        label={tx('Entscheidung')}
        description={tx('Was wurde entschieden, warum und auf welchem Weg?')}
        needs={['vorgang']}
      >
        <div className="space-y-4">
          <Bound form={f} name="titel" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={f} name="entscheider_vorname" />
            <Bound form={f} name="entscheider_nachname" />
          </div>
          <Bound form={f} name="begruendung" rows={3} />
          <Bound form={f} name="alternativen" rows={3} />
          <Bound form={f} name="loesungsweg" rows={3} />
          <Bound form={f} name="werkzeug" />
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
            items={[
              { key: 'gueltigkeit', label: tx('Gültigkeit'), value: tx('Gültig') },
            ]}
            whatHappensNext={tx('Die Entscheidung wird mit dem heutigen Datum als gültig gespeichert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Ergebnis festhalten'), href: '#/intents/ergebnis-festhalten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Halte als Nächstes fest, was die Entscheidung bewirkt hat.')}
        />
      )}
    </IntentWizardShell>
  );
}
