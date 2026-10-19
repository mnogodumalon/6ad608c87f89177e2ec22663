/**
 * Vorgang abschließen — 3-Schritt-Wizard.
 * Steps: 1) Laufenden Vorgang wählen → 2) Übergabehinweise erfassen → 3) Abschluss bestätigen.
 * Reads: vorgaenge. Writes: vorgaenge (update: status, enddatum, uebergabehinweise) via useVorgangAbschliessenFlow.
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
import { useVorgangAbschliessenFlow } from '@/lib/journey/flows/VorgangAbschliessen';
import { tx } from '@/i18n';

export default function VorgangAbschliessenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorgangAbschliessenFlow({
    steps: { vorgaenge: 1, uebergabehinweise: 2 },
    items: {
      vorgaenge: r => {
        const person = `${fieldText(r, 'verantwortlich_nachname')}`.trim();
        const bereich = fieldText(r, 'bereich');
        return {
          id: r.id,
          title: fieldText(r, 'titel'),
          subtitle: [bereich, person].filter(Boolean).join(' · '),
          status: fieldLookup(r, 'status') ?? undefined,
        };
      },
    },
  });

  const pickedId = flow.pick('vorgaenge').selectedId as string | undefined;
  const picked = pickedId ? flow.picks.vorgaenge.recordOf(pickedId) : undefined;
  const today = format(new Date(), 'dd.MM.yyyy');

  return (
    <IntentWizardShell
      title={tx('Vorgang abschließen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Einen Vorgang mit Übergabehinweisen abschließen, damit das Wissen erhalten bleibt.'),
        needs: [tx('Der laufende Vorgang'), tx('Hinweise für die Übergabe')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Welchen laufenden Vorgang möchtest du abschließen?')}>
        <EntitySelectStep
          {...flow.picks.vorgaenge.select}
          {...flow.pick('vorgaenge')}
          searchPlaceholder={tx('Titel suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Übergabe')} description={tx('Was muss die nächste Person wissen? Stand, offene Punkte, Stolpersteine.')}>
        {pickedId ? (
          <div className="space-y-4">
            {picked && (
              <div className="rounded-2xl bg-secondary p-4 text-sm">
                <p className="font-medium text-foreground">{fieldText(picked, 'titel')}</p>
                <p className="text-muted-foreground">
                  {[fieldText(picked, 'bereich'), fieldLookup(picked, 'status')?.label].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
            <Bound
              form={flow.forms.vorgaenge}
              name="uebergabehinweise"
              rows={6}
              hint={tx('Je konkreter, desto leichter gelingt der Wechsel.')}
            />
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => flow.validateStep(2)}
              nextStepLabel={tx('Prüfen')}
            />
          </div>
        ) : (
          <StepNav onBack={() => setStep(1)} nextDisabled>
            {tx('Dieser Schritt braucht die Auswahl aus Schritt 1.')}
          </StepNav>
        )}
      </WizardStep>
      <WizardStep label={tx('Prüfen')} description={tx('Alles richtig? Danach gilt der Vorgang als abgeschlossen.')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'status', label: tx('Status'), value: tx('Abgeschlossen') },
              { key: 'enddatum', label: tx('Enddatum'), value: today },
            ]}
            whatHappensNext={tx('Der Vorgang wird als abgeschlossen markiert und bekommt heute als Enddatum.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          actions={{ copy: false, print: false }}
          next={[
            { label: tx('Entscheidung dokumentieren'), href: '#/intents/entscheidung-dokumentieren' },
            { label: tx('Regel ableiten'), href: '#/intents/regel-ableiten' },
            { label: tx('Vorgang anlegen'), href: '#/intents/vorgang-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Die Übergabehinweise stehen jetzt im Vorgang bereit.')}
        />
      )}
    </IntentWizardShell>
  );
}
