export function Hero() {
  const pills = ["10-Question Mock Test", "Deep Reasoning Engine", "Hindi and English"];
  return (
    <section className="w-full bg-white border-b border-brand-200 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,244,255,0.04) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(202,244,255,0.04) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left copy */}
        <div className="relative z-10">
          <span className="inline-flex items-center bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-5">
            Built for Indian Students
          </span>
          <p className="text-sm font-bold text-brand-500 mb-3 tracking-wide">Learn Smarter, Not Harder</p>
          <h1 className="font-display text-5xl font-black text-slate-900 leading-[1.08] mb-5">
            Meet Your Personal<br />
            <span className="text-brand-500">AI Tutor</span>
          </h1>
          <p className="text-[15px] text-slate-500 leading-relaxed mb-8 max-w-[440px]">
            Master any subject with an AI tutor that explains concepts in simple language,
            uses relatable Indian examples, and tests you with a custom mock test.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {pills.map((p) => (
              <span key={p} className="text-[12px] font-semibold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5">
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Right decorative */}
        <div className="relative z-10 flex justify-center items-center">
          <div className="relative w-[360px] h-[300px]">
            {/* Score card */}
            <div className="absolute top-2 left-0 bg-white border border-brand-200 rounded-2xl p-5 shadow-lg shadow-brand-500/10 z-20 min-w-[155px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Score</p>
              <p className="font-display text-3xl font-black text-brand-500">8 / 10</p>
              <div className="h-1.5 bg-brand-100 rounded-full mt-3">
                <div className="h-full w-4/5 bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" />
              </div>
            </div>
            {/* Mascot */}
            <div className="absolute top-5 right-0 w-[175px] h-[175px] bg-gradient-to-br from-brand-100 to-brand-50 rounded-full flex items-center justify-center text-[84px] ring-1 ring-brand-200 shadow-xl shadow-brand-500/12 animate-float z-10">
              🤖
            </div>
            {/* Badge */}
            <div className="absolute bottom-5 right-0 bg-white border border-green-200 rounded-xl px-4 py-3 shadow-md shadow-green-500/10 z-20">
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Topic Mastered</p>
              <p className="text-[13px] font-bold text-slate-800">Photosynthesis</p>
            </div>
            {/* Decorative books */}
            <div className="absolute bottom-2 left-2 flex gap-2 items-end z-0">
              <div className="w-12 h-2 rounded-sm bg-gradient-to-r from-yellow-300 to-yellow-400 -rotate-3" />
              <div className="w-16 h-3.5 rounded bg-gradient-to-r from-indigo-300 to-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
