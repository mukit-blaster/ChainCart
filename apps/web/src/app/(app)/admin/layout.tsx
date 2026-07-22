import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar kind="admin" />
      <main className="flex-1 px-4 md:px-8 py-4 md:py-6 min-w-0">{children}</main>
    </>
  );
}
