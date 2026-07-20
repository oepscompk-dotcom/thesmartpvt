"use client";

const badges = [
  "Secure Login",
  "Franchise Isolation",
  "Encrypted Sessions",
  "Audit Logs Enabled",
];

export default function SecurityBadges() {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {badges.map((text) => (
        <div key={text} className="flex items-center gap-2 text-white/40 text-xs">
          <div className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-2.5 h-2.5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}
