// components/RomanceSlider.tsx
"use client";

type Props = {
  value: 0 | 1 | 2; // 0=neutral, 1=flirt-light, 2=varmt & charmigt (PG-13)
  onChange: (v: 0 | 1 | 2) => void;
  compact?: boolean;
};

export default function RomanceSlider({ value, onChange, compact = false }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition";
  const active = "bg-white text-gray-900 border-white";
  const inactive = "border-white/20 text-white hover:bg-white/10";
  const size = compact ? "text-xs px-2 py-1" : "";

  const buttons = [
    { v: 0 as const, label: "Neutral" },
    { v: 1 as const, label: "Flirt-light" },
    { v: 2 as const, label: "Varm & charmig" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((b) => (
        <button
          key={b.v}
          className={`${base} ${size} ${value === b.v ? active : inactive}`}
          onClick={() => onChange(b.v)}
          aria-pressed={value === b.v}
          title={
            b.v === 0
              ? "Saklig & vänlig"
              : b.v === 1
              ? "Lätt flirt, respektfullt"
              : "Mer värme & romantik (PG-13)"
          }
        >
          {b.v === 0 && "🙂 "}{b.v === 1 && "😉 "}{b.v === 2 && "💞 "}{b.label}
        </button>
      ))}
    </div>
  );
}
