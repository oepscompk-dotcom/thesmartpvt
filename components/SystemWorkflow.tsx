"use client";

export default function SystemWorkflow() {
  const steps = [
    { label: "Head Office", color: "bg-brand-gold", textColor: "text-brand-gold" },
    { label: "Franchise", color: "bg-brand-navy", textColor: "text-brand-navy" },
    { label: "DSM", color: "bg-brand-sky", textColor: "text-brand-sky" },
    { label: "DSO", color: "bg-brand-blue", textColor: "text-brand-blue" },
    { label: "Customer", color: "bg-green-500", textColor: "text-green-500" },
  ];

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy/5 rounded-full text-brand-navy text-sm font-medium mb-4">
            Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-4">
            How the System <span className="text-brand-gold">Works</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Streamlined workflow from head office to customer delivery
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${step.color} flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer`}
                >
                  {step.label}
                </div>
                <span className="mt-3 text-xs sm:text-sm font-medium text-gray-500">
                  Step {index + 1}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center mx-4 mt-[-20px]">
                  <div className="w-16 lg:w-24 h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-gray-300" />
                  </div>
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="md:hidden my-2">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200 relative mx-auto">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-gray-300" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
