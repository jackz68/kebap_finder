export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200/60 dark:border-zinc-700/60 bg-white/70 dark:bg-zinc-900/70 supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">React + Vite + Tailwind v4</h1>
        <nav className="text-sm opacity-80">placeholder nav</nav>
      </div>
    </header>
  );
}
