"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, Wallet } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthVisual } from "@/components/AuthVisual";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api";
import { walletLogin } from "@/lib/wallet";
import { useAuthStore } from "@/stores/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Required"),
});

type Form = z.infer<typeof schema>;

const DEMOS: { label: string; role: string; email: string }[] = [
  { label: "Customer", role: "Buyer demo", email: "customer@chaincart.dev" },
  { label: "Seller", role: "Helix Atelier", email: "helix-atelier@chaincart.dev" },
  { label: "Admin", role: "Platform admin", email: "admin@chaincart.dev" },
];

function LoginPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const setSession = useAuthStore((s) => s.setSession);
  const [walletBusy, setWalletBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (form: Form) => {
    try {
      const { data } = await api.post("/auth/login", form);
      setSession(data);
      toast.success(`Welcome back, ${data.user.name?.split(" ")[0] ?? "there"}`);
      const dest =
        data.user.role === "ADMIN"
          ? "/admin"
          : data.user.role === "SELLER"
            ? "/seller"
            : next;
      router.push(dest);
    } catch {
      toast.error("Invalid email or password");
    }
  };

  const onWallet = async () => {
    setWalletBusy(true);
    try {
      await walletLogin();
      toast.success("Wallet connected");
      router.push(next);
    } catch (err) {
      toast.error((err as Error).message ?? "Wallet login failed");
    } finally {
      setWalletBusy(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });
  };

  return (
    <>
      <AuthVisual
        eyebrow="Live · 243 verifications today"
        headline="Pick up where you left off."
        body="Your cart, saved items, and NFT warranties are waiting. Sign in to keep collecting verified pieces."
        testimonial={{
          name: "Maya Lin",
          role: "Watch collector",
          quote:
            "ChainCart's NFT warranty made my resale ironclad. Authenticity proof is a game-changer.",
        }}
      />

      <div className="flex items-center justify-center px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="cc-eyebrow mb-2">Welcome back</div>
          <h1 className="cc-h1 mb-2">Sign in to ChainCart</h1>
          <p className="text-fg2 mb-7">
            New here?{" "}
            <Link href="/register" className="text-brand font-medium hover:underline">
              Create an account
            </Link>
          </p>

          {/* Demo accounts strip */}
          <div className="cc-card p-3 mb-6">
            <div className="cc-eyebrow mb-2">Demo accounts</div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email)}
                  className="min-w-0 rounded-lg border border-border px-2 sm:px-3 py-2 text-left hover:border-brand hover:bg-brand/5 transition"
                >
                  <div className="text-[10px] sm:text-[11px] text-muted truncate">{d.role}</div>
                  <div className="text-sm font-medium truncate">{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Field
              label="Password"
              hint={
                <Link href="/forgot" className="text-brand hover:underline">
                  Forgot?
                </Link>
              }
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" variant="brand" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="lg" className="rounded-full" onClick={onWallet} disabled={walletBusy}>
              {walletBusy ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              Wallet
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full" disabled>
              <GoogleIcon /> Google
            </Button>
          </div>

          <p className="text-[11px] text-muted text-center mt-6">
            By signing in, you agree to our{" "}
            <Link className="underline hover:text-fg2" href="#">Terms</Link> and{" "}
            <Link className="underline hover:text-fg2" href="#">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.3-13.6l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.1a12 12 0 0 1-19-5.5l-6.5 5A20 20 0 0 0 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.7l6.2 5.1c-.4.4 6.6-4.8 6.6-14.8 0-1.2-.1-2.3-.4-3.5z" />
  </svg>
);
