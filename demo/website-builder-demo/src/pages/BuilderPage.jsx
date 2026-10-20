import React from 'react';
import { useBuilder } from '../context/BuilderContext';
import { Step1Type } from '../components/builder/Step1Type';
import { Step2Info } from '../components/builder/Step2Info';
import { Step3Palette } from '../components/builder/Step3Palette';
import { Step4Layout } from '../components/builder/Step4Layout';
import { Step5Preview } from '../components/builder/Step5Preview';

export const BuilderPage = () => {
  const { step } = useBuilder();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Main website-builder content placed directly below the navbar */}
      <main className="flex-1 flex flex-col">
        {step === 1 && <Step1Type />}
        {step === 2 && <Step2Info />}
        {step === 3 && <Step3Palette />}
        {step === 4 && <Step4Layout />}
        {step === 5 && <Step5Preview />}
      </main>
    </div>
  );
};
