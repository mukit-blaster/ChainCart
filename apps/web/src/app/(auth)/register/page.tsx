"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, Mail, ShoppingBag, Store, User } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthVisual } from "@/components/AuthVisual";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/cn";

const schema = z.object({
  name: z.string().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(128, "Too long"),
  role: z.enum(["CUSTOMER", "SELLER"]),
});

type Form = z.infer<typeof schema>;

const ROLES = [
  {
    id: "CUSTOMER",
    title: "Shop & collect",
    body: "Buy verified products, earn NFT warranties, and resell with provenance.",
    icon: ShoppingBag,
  },
  {
    id: "SELLER",
    title: "Sell & earn",
    body: "Open a verified storefront, mint warranties, and pay out instantly.",
    icon: Store,
  },
] as const;

const passwordScore = (s: string) => {
  let score = 0;
  if (s.length >= 8) score++;
  if (s.length >= 12) score++;
  if (/[A-Z]/.test(s) && /[a-z]/.test(s)) score++;
  if (/\d/.test(s)) score++;
  if (/[^a-zA-Z0-9]/.test(s)) score++;
  return Math.min(score, 4);
};
const STRENGTH = ["Weak", "Fair", "Good", "Strong", "Excellent"] as const;
const STRENGTH_COLOR = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#2563EB"];

function RegisterPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const initialRole = (search.get("role")?.toUpperCase() === "SELLER" ? "SELLER" : "CUSTOMER") as Form["role"];
  const setSession = useAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: initialRole },
    mode: "onBlur",
  });

  const password = watch("password") ?? "";
  const role = watch("role");
  const score = passwordScore(password);

  const onSubmit = async (form: Form) => {
    try {
      const { data } = await api.post("/auth/register", form);
      setSession(data);
      toast.success("Welcome to ChainCart");
      router.push(form.role === "SELLER" ? "/seller" : "/dashboard");
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ?? "Could not register — try a different email";
      toast.error(msg);
    }
  };

  return (
    <>
      <AuthVisual
        eyebrow={role === "SELLER" ? "Open onboarding · 5-minute setup" : "Free forever · No card required"}
        headline={
          role === "SELLER"
            ? "Build a verified storefront."
            : "Shop with confidence, on-chain."
        }
        body={
          role === "SELLER"
            ? "List products, mint NFT warranties, and get paid out instantly. Verified sellers see a 4× lift in trust signals."
            : "Every purchase carries a tamper-proof certificate. Resell with provenance, prove ownership at a glance."
        }
        testimonial={{
          name: "Daniel Park",
          role: "Independent seller",
          quote:
            "Listing on ChainCart took an afternoon. Payouts are instant and the realtime chat closes more sales than email ever did.",
        }}
      />

      <div className="flex items-center justify-center px-6 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="cc-eyebrow mb-2">Create account</div>
          <h1 className="cc-h1 mb-2">Join ChainCart</h1>
          <p className="text-fg2 mb-7">
            Already a member?{" "}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setValue("role", r.id)}
                  className={cn(
                    "relative text-left rounded-xl border p-4 transition",
                    active
                      ? "border-brand bg-brand/5 shadow-[0_0_0_4px_rgba(37,99,235,.1)]"
                      : "border-border hover:bg-surface2",
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition",
                      active ? "bg-brand text-white" : "bg-surface2 text-fg2",
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-snug">{r.body}</div>
                  {active && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field
              label="Full name"
              placeholder="Casey Customer"
              autoComplete="name"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register("name")}
            />
            <Field
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <div>
              <Field
                label="Password"
                hint={password ? STRENGTH[score] : <span className="text-muted">8+ characters</span>}
                type="password"
                placeholder="Choose a strong password"
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                error={errors.password?.message}
                {...register("password")}
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 rounded-full transition-colors"
                    style={{
                      background: i < score ? STRENGTH_COLOR[score] : "rgb(var(--cc-border))",
                    }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" variant="brand" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="text-[11px] text-muted text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link className="underline hover:text-fg2" href="#">Terms</Link> and{" "}
            <Link className="underline hover:text-fg2" href="#">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}
