/**
 * Regel ableiten — 3-Schritt-Wizard.
 * Steps: 1) Herkunft wählen (Vorgang, Entscheidung, Ergebnis, Annahme) → 2) Titel, Regeltext, Geltungsbereich → 3) Verlässlichkeit, Prüftermin, KI-Hinweis → Prüfen & anlegen.
 * Reads: vorgaenge, entscheidungen_und_loesungswege, ergebnisse_und_grenzen, annahmen. Writes: regeln (als Entwurf, via useRegelAbleitenFlow).
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
import { useRegelAbleitenFlow } from '@/lib/journey/flows/RegelAbleiten';
import { tx } from '@/i18n';

export default function RegelAbleitenPage() {
  const [step, setStep] = useState(1);
  const flow = useRegelAbleitenFlow({
    steps: {
      vorgang: 1, entscheidung: 1, ergebnis: 1, annahme: 1,
      titel: 2, regeltext: 2, geltungsbereich: 2,
      verlaesslichkeitsgrad: 3, naechste_pruefung: 3, ki_hinweis: 3,
    },
    items: {
      vorgang: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'status')?.label }),
      entscheidung: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'gueltigkeit')?.label }),
      ergebnis: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: [fieldLookup(r, 'art')?.label, fieldLookup(r, 'verlaesslichkeit')?.label].filter(Boolean).join(' · '),
      }),
      annahme: r => ({ id: r.id, title: fieldText(r, 'aussage'), subtitle: fieldLookup(r, 'pruefstatus')?.label }),
    },
  });
  const f = flow.forms.regeln;

  return (
    <IntentWizardShell
      title={tx('Regel ableiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Formuliere aus einer Entscheidung, einem Ergebnis oder einer Annahme eine Regel als Entwurf.'),
        needs: [tx('Die Quelle der Regel'), tx('Regeltext')],
      }}
    >
      <WizardStep label={tx('Herkunft')} description={tx('Woraus leitest du die Regel ab? Wähle die passenden Quellen aus.')}>
        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Vorgang')}</h3>
            <EntitySelectStep {...flow.picks.vorgang.select} {...flow.pick('vorgang')} />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Entscheidung')}</h3>
            <EntitySelectStep {...flow.picks.entscheidung.select} {...flow.pick('entscheidung')} />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Ergebnis')}</h3>
            <EntitySelectStep {...flow.picks.ergebnis.select} {...flow.pick('ergebnis')} />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Annahme')}</h3>
            <EntitySelectStep {...flow.picks.annahme.select} {...flow.pick('annahme')} />
          </section>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Regeltext')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Regeltext')} description={tx('Formuliere die Regel und sage, wo sie gilt.')}>
        <div className="space-y-4">
          <Bound form={f} name="titel" />
          <Bound form={f} name="regeltext" rows={5} />
          <Bound form={f} name="geltungsbereich" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Verlässlichkeit')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Verlässlichkeit')} description={tx('Wie belastbar ist die Regel, und wann soll sie überprüft werden?')}>
        <div className="space-y-4">
          <Bound form={f} name="verlaesslichkeitsgrad" />
          <Bound form={f} name="naechste_pruefung" />
          <Bound form={f} name="ki_hinweis" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Entwurf') }]}
            whatHappensNext={tx('Die Regel wird als Entwurf angelegt und gilt erst, wenn sie freigegeben wird.')}
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
            { label: tx('Entscheidung dokumentieren'), href: '#/intents/entscheidung-dokumentieren' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Die Regel steht als Entwurf bereit.')}
        />
      )}
    </IntentWizardShell>
  );
}
