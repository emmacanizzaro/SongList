import { MobileNavigation, Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell flex min-h-screen overflow-hidden dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-40 dark:opacity-20" />
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto">
        <MobileNavigation />
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="page-section min-h-[calc(100vh-5.5rem)] px-4 py-6 sm:px-8 sm:py-8 lg:min-h-[calc(100vh-2rem)] lg:px-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
