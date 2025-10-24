// components/ModePicker.tsx
"use client";

type Props = {
  value: "mjuk" | "rak" | "kreativ";
  onChange: (v: "mjuk" | "rak" | "kreativ") => void;
  compact?: boolean; // mindre variant i chatten
};

export default function ModePicker({ value, onChange, compact = false }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition";
  const active = "bg-white text-gray-900 border-white";
  const inactive = "border-white/20 text-white hover:bg-white/10";
  const size = compact ? "text-xs px-2 py-1" : "";

  return (
    <div className="flex flex-wrap gap-2">
      {(["mjuk", "rak", "kreativ"] as const).map((m) => (
        <button
          key={m}
          className={`${base} ${size} ${value === m ? active : inactive}`}
          onClick={() => onChange(m)}
          aria-pressed={value === m}
        >
          {m === "mjuk" && "🫶 Mjuk"}
          {m === "rak" && "🎯 Rak"}
          {m === "kreativ" && "✨ Kreativ"}
        </button>
      ))}
    </div>
  );
}
