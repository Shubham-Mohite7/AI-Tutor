export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-brand-200 shadow-sm shadow-brand-500/5">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 h-16 flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-12 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 12H1L7 1Z" fill="white" />
            </svg>
          </div>
          <span className="font-display text-[17px] font-black text-slate-900 tracking-tight">
            AITutor
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-7">
          {["How It Works", "Features", "Who It's For", "Why Us", "FAQ"].map((l) => (
            <a key={l} href="#" className="text-[13px] text-slate-500 font-medium hover:text-brand-500 transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="ml-auto">
          <button className="text-[13px] font-bold text-white bg-brand-500 hover:bg-brand-600 px-5 py-2 rounded-full transition-all shadow-md shadow-brand-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/35 active:translate-y-0">
            Try It Free
          </button>
        </div>
      </div>
    </nav>
  );
}
