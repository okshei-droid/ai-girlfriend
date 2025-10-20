export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-6 min-h-[100dvh]
                     bg-[radial-gradient(60%_40%_at_50%_0%,_var(--luna-tint),_transparent_70%)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome 💜</h1>
        <p className="text-gray-600 mt-1">
          Choose your companion. You can chat in any language — Luna will follow you.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Luna card */}
        <a href="/chat" className="group flex items-center gap-4 border rounded-2xl p-4 bg-white/70 backdrop-blur hover:bg-white transition">
          <img
            src="/icons/avatar-luna.png"
            alt="Luna"
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--luna-accent)]"
          />
          <div>
            <div className="font-medium">Luna</div>
            <div className="text-sm text-gray-600">Warm, romantic & playful</div>
          </div>
          <div className="ml-auto text-[var(--luna-accent)] group-hover:translate-x-0.5 transition">→</div>
        </a>

        {/* Future personas placeholder */}
        <div className="opacity-60 border rounded-2xl p-4 bg-white/50 backdrop-blur">
          <div className="font-medium">Aurora (coming soon)</div>
          <div className="text-sm text-gray-600">Gentle & spiritual growth</div>
        </div>
        <div className="opacity-60 border rounded-2xl p-4 bg-white/50 backdrop-blur">
          <div className="font-medium">Nova (coming soon)</div>
          <div className="text-sm text-gray-600">Supportive life coach</div>
        </div>
      </div>
    </main>
  )
}
