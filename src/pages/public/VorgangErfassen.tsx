import { useEffect, useMemo, useState } from 'react';
import { PublicShell } from '@/components/PublicShell';
import { tx } from '@/i18n';
import {
  loadPublicPagesConfig,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';
import { useStepForm, useJourneySubmit } from '@/lib/journey';
import { createPublicPort } from '@/lib/journey/publicPort';
import { IntentWizardShell } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';

const SLUG = 'vorgang-erfassen';

function Wizard({ cfg, page }: { cfg: PublicPagesConfig; page: PublicPageConfig }) {
  const [step, setStep] = useState(1);
  const port = useMemo(() => createPublicPort(cfg, page), [cfg, page]);

  const form = useStepForm('vorgaenge', {
    fields: ['titel', 'beschreibung', 'bereich', 'verantwortlich_vorname', 'verantwortlich_nachname', 'startdatum', 'enddatum', 'werkzeuge'],
    required: { titel: true },
    autoComplete: true,
    steps: {
      titel: 1, beschreibung: 1, bereich: 1, verantwortlich_vorname: 1, verantwortlich_nachname: 1,
      startdatum: 2, enddatum: 2, werkzeuge: 2,
    },
  });

  const submit = useJourneySubmit(
    port,
    [{ key: 'vorgang', entity: 'vorgaenge', form, primary: true }],
    { draftKey: SLUG },
  );

  const steps = [
    { label: tx('Titel & Verantwortliche'), description: tx('Worum geht es und wer kümmert sich darum?') },
    { label: tx('Zeitraum & Werkzeuge'), description: tx('In welchem Zeitraum läuft der Vorgang und welche Werkzeuge kommen zum Einsatz?') },
    { label: tx('Prüfen & anlegen') },
  ];

  const checkPeriod = () => {
    const start = form.get('startdatum') as string | null;
    const end = form.get('enddatum') as string | null;
    if (start && end && end < start) {
      return tx('Das Enddatum darf nicht vor dem Startdatum liegen.');
    }
    return true;
  };

  return (
    <IntentWizardShell
      steps={steps}
      currentStep={step}
      onStepChange={setStep}
      back={false}
      forms={[form]}
      draftKey={SLUG}
    >
      {step === 1 && (
        <div className="space-y-5">
          <Bound form={form} name="titel" />
          <Bound form={form} name="beschreibung" />
          <Bound form={form} name="bereich" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={form} name="verantwortlich_vorname" />
            <Bound form={form} name="verantwortlich_nachname" />
          </div>
          <StepNav
            hideBack
            onNext={() => form.validate(['titel'])}
            nextStepLabel={tx('Zeitraum & Werkzeuge')}
          />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Bound form={form} name="startdatum" />
            <Bound form={form} name="enddatum" />
          </div>
          <Bound form={form} name="werkzeuge" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => checkPeriod()}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      )}
      {step === 3 && !submit.done && (
        <SummaryStep
          forms={[form]}
          submit={submit}
          whatHappensNext={tx('Dein Vorgang wird angelegt und das Team ergänzt die Übergabehinweise später.')}
        />
      )}
      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[form]}
          submit={submit}
          title={tx('Vorgang angelegt')}
          restartLabel={tx('Weiteren Vorgang erfassen')}
          whatHappensNext={tx('Danke! Dein Vorgang wurde erfasst.')}
        />
      )}
    </IntentWizardShell>
  );
}

export default function VorgangErfassen() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPagesConfig(SLUG)
      .then(c => {
        setCfg(c);
        setPage(c?.pages[SLUG] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !cfg || !page) {
    return <PublicShell loading={loading} unavailable={!loading} />;
  }

  return (
    <PublicShell title={page.title} description={page.description}>
      <Wizard cfg={cfg} page={page} />
    </PublicShell>
  );
}
