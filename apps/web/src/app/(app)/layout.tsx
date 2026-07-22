import { TopNav } from "@/components/TopNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav />
      <div className="flex max-w-[1440px] mx-auto pt-2">{children}</div>
    </div>
  );
}
