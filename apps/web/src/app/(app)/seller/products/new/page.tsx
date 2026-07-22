"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const schema = z.object({
  title: z.string().min(2, "Title is too short").max(200),
  description: z.string().min(10, "Tell buyers more — at least 10 characters"),
  price: z.coerce.number().positive("Enter a price above $0"),
  discountPct: z.coerce.number().int().min(0).max(90).default(0),
  stock: z.coerce.number().int().min(0, "Stock can't be negative").default(0),
  sku: z.string().min(2, "SKU is too short").max(64),
  categoryId: z.string().optional(),
  hasNFTWarranty: z.boolean().default(false),
  imageUrls: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<{ items: Category[] }>("/categories");
      return data.items;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { discountPct: 0, stock: 0, hasNFTWarranty: false },
  });

  const onSubmit = async (form: Form) => {
    const images = (form.imageUrls ?? "")
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.title }));

    try {
      const { data } = await api.post("/products", {
        title: form.title,
        description: form.description,
        priceCents: Math.round(form.price * 100),
        discountPct: form.discountPct,
        stock: form.stock,
        sku: form.sku,
        categoryId: form.categoryId || undefined,
        hasNFTWarranty: form.hasNFTWarranty,
        images,
      });
      await queryClient.invalidateQueries({ queryKey: ["seller.products"] });
      toast.success(`${data.title} is live`);
      router.push("/seller/products");
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ?? "Could not create product — try again";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-1.5 text-sm text-fg2 hover:text-fg mb-3"
        >
          <ArrowLeft size={14} /> Back to products
        </Link>
        <h1 className="cc-h1">New product</h1>
        <p className="text-fg2">List a new item in your storefront.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="Title"
            placeholder="Hand-thrown ceramic mug"
            error={errors.title?.message}
            {...register("title")}
          />

          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">Description</span>
            <textarea
              rows={4}
              placeholder="What makes this product worth buying?"
              className="cc-input w-full resize-none"
              {...register("description")}
            />
            {errors.description && (
              <span className="text-[11px] text-danger mt-1.5 block">
                {errors.description.message}
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="24.99"
              error={errors.price?.message}
              {...register("price")}
            />
            <Field
              label="Stock"
              type="number"
              min="0"
              step="1"
              placeholder="10"
              error={errors.stock?.message}
              {...register("stock")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="SKU"
              placeholder="MUG-001"
              error={errors.sku?.message}
              {...register("sku")}
            />
            <Field
              label="Discount %"
              hint="Optional"
              type="number"
              min="0"
              max="90"
              step="1"
              placeholder="0"
              error={errors.discountPct?.message}
              {...register("discountPct")}
            />
          </div>

          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">Category</span>
            <select className="cc-input w-full" {...register("categoryId")}>
              <option value="">Uncategorized</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium mb-1.5 block">
              Image URLs <span className="text-muted font-normal">(one per line, optional)</span>
            </span>
            <textarea
              rows={3}
              placeholder="https://example.com/image1.jpg"
              className="cc-input w-full resize-none"
              {...register("imageUrls")}
            />
          </label>

          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded" {...register("hasNFTWarranty")} />
            Mint an NFT warranty for this product
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="brand" className="rounded-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Publishing…
                </>
              ) : (
                "Publish product"
              )}
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link href="/seller/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
