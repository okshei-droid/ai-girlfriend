// components/PersonaCard.tsx
"use client";

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  onStart: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
};

export default function PersonaCard({
  title,
  subtitle,
  description,
  onStart,
  onContinue,
  canContinue = false,
}: Props) {
  const initial = title?.[0]?.toUpperCase() ?? "L";

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md transition hover:bg-white/10"
      role="article"
      aria-label={`${title} persona card`}
    >
      <div className="flex items-center gap-4">
        {/* Inbyggd avatar (ingen bildfil behövs) */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 ring-2 ring-white/20">
          <span className="text-xl font-bold text-white">{initial}</span>
        </div>
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-white/70 leading-tight">{subtitle}</p>
          )}
        </div>
      </div>

      {description && (
        <p className="mt-4 text-white/80 leading-relaxed">{description}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition
                     bg-white text-gray-900 hover:shadow-lg active:scale-[.98]"
          onClick={onStart}
        >
          Starta chat
        </button>

        <button
          className="rounded-xl px-4 py-2 text-sm font-medium transition
                     border border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
          onClick={() => onContinue?.()}
          disabled={!canContinue}
          aria-disabled={!canContinue}
          title={!canContinue ? "Ingen tidigare konversation hittad" : "Fortsätt chat"}
        >
          Fortsätt chat
        </button>
      </div>
    </div>
  );
}
