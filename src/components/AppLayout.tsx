import { TopNav } from "@/components/TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <TopNav />
      <div className="pointer-events-none fixed inset-x-0 top-16 h-72 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.09),transparent_70%)]" aria-hidden="true" />
      <main className="relative mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
        {children}
      </main>
    </div>
  );
}
