"use client";

interface Props {
  text: string;
  className?: string;
}

export default function AnimatedGradientText({ text, className = "" }: Props) {
  return (
    <span className={`bg-gradient-to-r from-brand-gold via-[#E8D5A3] to-brand-gold bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient ${className}`}>
      {text}
    </span>
  );
}
