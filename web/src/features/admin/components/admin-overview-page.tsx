export function AdminOverviewPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-7xl items-center px-5 py-12 sm:px-8">
      <header className="max-w-2xl">
        <p className="mb-3 font-mono text-xs font-bold uppercase tracking-widest text-admin-muted">
          StarChart Admin
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-admin-ink sm:text-5xl">
          Welcome to StarChart
        </h1>
        <p className="mt-4 text-base leading-7 text-admin-muted-strong sm:text-lg">
          Manage the content and curation tools that power the StarChart
          experience.
        </p>
      </header>
    </main>
  );
}
