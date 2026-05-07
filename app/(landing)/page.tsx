// web/app/(landing)/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import LoginModal from "./components/login-modal";

// ---------- Intersection Observer hook for scroll animations ----------
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

// ---------- Feature Card ----------
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`group relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm border border-gray-200/60 dark:border-zinc-700/60 rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:border-blue-300/60 dark:hover:border-blue-500/40 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mb-5 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ---------- Step ----------
function Step({
  number,
  title,
  description,
  delay,
}: {
  number: string;
  title: string;
  description: string;
  delay: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-500 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
        {number}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

// ======================================================================
// Landing Page
// ======================================================================
export default function LandingPage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on the hero decorative blobs
  useEffect(() => {
    function handleScroll() {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================================================ */}
      {/* Navbar */}
      {/* ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              Smart Life Coach
            </span>
          </div>

          {/* CTA */}
          <button
            id="nav-login-btn"
            onClick={() => setLoginOpen(true)}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            Iniciar sesión
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* Hero */}
      {/* ============================================================ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Decorative blobs */}
        <div ref={heroRef} className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-linear-to-t from-blue-100/40 to-transparent dark:from-blue-900/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium mb-8 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Impulsado por Inteligencia Artificial
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6 animate-fade-in-up animation-delay-100">
            Tu coach de vida{" "}
            <span className="bg-linear-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              inteligente
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Planifica tus metas, organiza tus tareas y alcanza tus objetivos
            con la ayuda de un asistente de IA que te conoce.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
            <button
              id="hero-cta-btn"
              onClick={() => setLoginOpen(true)}
              className="px-8 py-3.5 text-base font-semibold rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
            >
              Comenzar gratis
            </button>
            <button
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 text-base font-medium rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200 w-full sm:w-auto"
            >
              Explorar funciones
            </button>
          </div>
        </div>

        {/* Hero visual – abstract app preview */}
        <div className="max-w-3xl mx-auto mt-16 animate-fade-in-up animation-delay-400">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/10 dark:shadow-black/30 border border-gray-200/60 dark:border-zinc-700/60">
            {/* Mock top bar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200/60 dark:border-zinc-700/60 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-8">
                <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-md max-w-xs mx-auto" />
              </div>
            </div>
            {/* Mock app body */}
            <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 p-6 md:p-8">
              <div className="flex gap-4 md:gap-6">
                {/* Fake sidebar */}
                <div className="hidden sm:flex flex-col gap-3 w-40 shrink-0">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-9 rounded-lg ${
                        i === 1
                          ? "bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30"
                          : "bg-white/60 dark:bg-zinc-800/60"
                      }`}
                    />
                  ))}
                </div>
                {/* Fake chat */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-500/30 shrink-0" />
                    <div className="bg-white dark:bg-zinc-800 rounded-xl rounded-bl-none p-3 max-w-[70%] space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-48" />
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-36" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-end justify-end">
                    <div className="bg-blue-600 rounded-xl rounded-br-none p-3 max-w-[60%] space-y-1.5">
                      <div className="h-3 bg-blue-400/50 rounded w-40" />
                      <div className="h-3 bg-blue-400/50 rounded w-24" />
                    </div>
                    <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-zinc-600 shrink-0" />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="w-7 h-7 rounded-full bg-blue-200 dark:bg-blue-500/30 shrink-0" />
                    <div className="bg-white dark:bg-zinc-800 rounded-xl rounded-bl-none p-3 max-w-[75%] space-y-1.5">
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-56" />
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-44" />
                      <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Features */}
      {/* ============================================================ */}
      <section id="features" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitas para{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                alcanzar tus metas
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Herramientas inteligentes diseñadas para ayudarte a planificar,
              organizar y ejecutar tus objetivos de vida.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              delay="0ms"
              icon={
                <svg
                  className="w-7 h-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              }
              title="Chat con IA"
              description="Conversa con tu coach inteligente impulsado por Gemini. Obtén planes personalizados, consejos y seguimiento en tiempo real."
            />
            <FeatureCard
              delay="100ms"
              icon={
                <svg
                  className="w-7 h-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              }
              title="Planes Personalizados"
              description="La IA crea planes de acción paso a paso adaptados a tus objetivos específicos. Visualiza tu progreso con barras dinámicas."
            />
            <FeatureCard
              delay="200ms"
              icon={
                <svg
                  className="w-7 h-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="Seguimiento de Tareas"
              description="Desglosa tus planes en tareas manejables. Marca tu progreso y mantente en el camino hacia tus metas."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* How it works */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28 px-6 bg-gray-50/50 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Tan fácil como{" "}
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                1, 2, 3
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[20%] right-[20%] h-px bg-linear-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800" />

            <Step
              delay="0ms"
              number="1"
              title="Cuéntale tu meta"
              description="Describe lo que quieres lograr al Smart Life Coach."
            />
            <Step
              delay="100ms"
              number="2"
              title="Recibe tu plan"
              description="La IA crea un plan personalizado con tareas específicas."
            />
            <Step
              delay="200ms"
              number="3"
              title="Logra tus objetivos"
              description="Sigue tu progreso y alcanza tus metas paso a paso."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Final CTA */}
      {/* ============================================================ */}
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* BG */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)]" />

            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Empieza a transformar tu vida hoy
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Únete y deja que la inteligencia artificial te guíe hacia tus
                objetivos.
              </p>
              <button
                id="final-cta-btn"
                onClick={() => setLoginOpen(true)}
                className="px-8 py-3.5 text-base font-semibold rounded-xl bg-white text-blue-700 shadow-lg shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Comenzar ahora — es gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Footer */}
      {/* ============================================================ */}
      <footer className="border-t border-gray-200/60 dark:border-zinc-800/60 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Smart Life Coach
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Smart Life Coach. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* Login Modal */}
      {/* ============================================================ */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* ============================================================ */}
      {/* Global animations */}
      {/* ============================================================ */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out both;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-400 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
}
