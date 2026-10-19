/**
 * Vorgang anlegen — 3-Schritt-Wizard mit Prüfen.
 * Steps: 1) Titel, Bereich und Verantwortliche → 2) Status, Zeitraum und Werkzeuge → 3) Optional erste Anforderung → Prüfen & anlegen.
 * Reads: — (nur über den Flow-Hook). Writes: vorgaenge, anforderungen_und_randbedingungen (nur wenn ausgefüllt).
 * Composes: IntentWizardShell, Bound, Field, ChoiceGroup, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useVorgangAnlegenFlow } from '@/lib/journey/flows/VorgangAnlegen';
import { optionsOf } from '@/lib/journey';
import { tx } from '@/i18n';

export default function VorgangAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorgangAnlegenFlow({
    steps: {
      titel: 1, beschreibung: 1, bereich: 1, verantwortlich_vorname: 1, verantwortlich_nachname: 1,
      startdatum: 2, werkzeuge: 2,
      art: 3, quelle: 3, prioritaet: 3, verlaesslichkeit: 3,
    },
  });
  const anf = flow.forms.anforderungen_und_randbedingungen;
  const anfStarted = Object.keys(anf.payload()).length > 0;
  const statusLabel = optionsOf('vorgaenge', 'status').find(o => o.key === 'geplant')?.label ?? 'geplant';

  return (
    <IntentWizardShell
      title={tx('Vorgang anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Neuen Vorgang erfassen und direkt erste Anforderungen dazu festhalten.'),
        needs: [tx('Titel des Vorgangs'), tx('Verantwortliche Person'), tx('Eingesetzte Werkzeuge')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Wie heißt der Vorgang und wer kümmert sich darum?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorgaenge} name="titel" />
          <Bound form={flow.forms.vorgaenge} name="beschreibung" rows={3} />
          <Bound form={flow.forms.vorgaenge} name="bereich" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={flow.forms.vorgaenge} name="verantwortlich_vorname" />
            <Bound form={flow.forms.vorgaenge} name="verantwortlich_nachname" />
          </div>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Zeitraum und Werkzeuge')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Zeitraum')} description={tx('Wann startet der Vorgang und womit wird gearbeitet?')}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tx`Der Vorgang startet mit dem Status „${statusLabel}“.`}
          </p>
          <Bound form={flow.forms.vorgaenge} name="startdatum" />
          <Bound form={flow.forms.vorgaenge} name="werkzeuge" rows={3} hint={tx('Werkzeuge und KI-Modelle, z. B. Claude, Excel')} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Erste Anforderung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Anforderung')} description={tx('Optional: eine erste Anforderung oder Randbedingung festhalten — sonst einfach weiter.')}>
        <div className="space-y-4">
          <Bound form={anf} name="art" allowClear />
          <Bound form={anf} name="titel" />
          <Bound form={anf} name="beschreibung" rows={3} />
          <Bound form={anf} name="quelle" />
          <Bound form={anf} name="prioritaet" allowClear />
          <Bound form={anf} name="verlaesslichkeit" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => (anfStarted ? flow.validateStep(3) : true)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: statusLabel }]}
            whatHappensNext={tx('Der Vorgang wird angelegt; eine ausgefüllte Anforderung wird direkt damit verknüpft.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Entscheidung dokumentieren'), href: '#/intents/entscheidung-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Als Nächstes kannst du Entscheidungen zu diesem Vorgang festhalten.')}
        />
      )}
    </IntentWizardShell>
  );
}
