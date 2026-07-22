import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <ThemeToggle />
          <Link href="/" className="text-fg2 hover:text-fg hidden sm:inline">
            Back to site
          </Link>
        </div>
      </header>
      <main className="flex-1 grid lg:grid-cols-2">{children}</main>
    </div>
  );
}
