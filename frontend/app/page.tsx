import { Navbar } from "@/app/components/layout/Navbar";
import { Hero } from "@/app/components/layout/Hero";
import { TutorApp } from "@/app/components/tutor/TutorApp";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <section className="flex-1 w-full max-w-screen-xl mx-auto px-6 md:px-12 py-12 flex flex-col gap-6">
        <TutorApp />
      </section>
      <footer className="text-center py-8 text-sm text-slate-400 font-medium">
        Built for Indian students &middot; Powered by GPT-OSS 120B with Deep Reasoning
      </footer>
    </main>
  );
}
