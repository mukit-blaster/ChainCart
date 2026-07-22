import { Sidebar } from "@/components/Sidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar kind="seller" />
      <main className="flex-1 px-4 md:px-8 py-4 md:py-6 min-w-0">{children}</main>
    </>
  );
}
