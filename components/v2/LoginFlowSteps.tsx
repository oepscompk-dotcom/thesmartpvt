"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export default function LoginFlowSteps({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isActive = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                isActive
                  ? "bg-brand-gold text-[#0A1628] scale-110"
                  : isCurrent
                  ? "bg-white/10 text-white border border-white/30 scale-110"
                  : "bg-white/5 text-white/30"
              }`}>
                {isActive ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap ${
                isActive ? "text-brand-gold" : isCurrent ? "text-white/70" : "text-white/30"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px mb-4 transition-all duration-500 ${
                isActive ? "bg-brand-gold" : "bg-white/10"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
