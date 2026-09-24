import { TopNav } from "@/components/TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopNav />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto w-full max-w-7xl mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
