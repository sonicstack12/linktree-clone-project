import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Eye, Copy, ImagePlus, X, Package, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

interface Product {
  id: string;
  profile_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  cover_image: string | null;
  gallery: string[];
  price: string | null;
  cta_label: string | null;
  cta_url: string | null;
  published: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-").slice(0, 60) || "product";
}

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [username, setUsername] = useState<string>("");

  const load = async () => {
    if (!user) return;
    const [pRes, profRes] = await Promise.all([
      supabase.from("products").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("username").eq("id", user.id).maybeSingle(),
    ]);
    setProducts((pRes.data ?? []) as unknown as Product[]);
    setUsername(profRes.data?.username ?? "");
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const create = async () => {
    if (!user) return;
    const base = slugify("untitled-product-" + Math.random().toString(36).slice(2, 6));
    const { data, error } = await supabase.from("products").insert({
      profile_id: user.id,
      slug: base,
      title: "Untitled product",
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setEditing(data as unknown as Product);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts((p) => p.filter((x) => x.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  if (loading) return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;

  if (editing) {
    return <ProductEditor product={editing} username={username} onClose={() => { setEditing(null); load(); }} onDelete={() => remove(editing.id)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build a mini landing page for anything you sell or showcase. Publish to get a shareable link you can drop into your Linkly.
          </p>
        </div>
        <Button variant="hero" onClick={create}>
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="grid place-items-center gap-3 p-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">No products yet</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Create your first product page — add a cover, gallery, description, and a buy button. Publish to get a link to share.
          </p>
          <Button variant="hero" onClick={create} className="mt-2">
            <Plus className="h-4 w-4" /> Create product
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden p-0">
              <div className="aspect-video bg-muted">
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><Package className="h-8 w-8" /></div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{p.title}</h3>
                    <p className="truncate text-xs text-muted-foreground">/p/{username}/{p.slug}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {p.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(p)}>Edit</Button>
                  {p.published && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/p/${username}/${p.slug}`} target="_blank" rel="noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductEditor({ product, username, onClose, onDelete }: {
  product: Product; username: string; onClose: () => void; onDelete: () => void;
}) {
  const [p, setP] = useState<Product>(product);
  const [saving, setSaving] = useState(false);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${username}/${p.slug}` : "";

  const update = (patch: Partial<Product>) => setP((cur) => ({ ...cur, ...patch }));

  const save = async (overrides: Partial<Product> = {}) => {
    setSaving(true);
    const next = { ...p, ...overrides };
    const { error } = await supabase.from("products").update({
      slug: next.slug,
      title: next.title,
      tagline: next.tagline,
      description: next.description,
      cover_image: next.cover_image,
      gallery: next.gallery,
      price: next.price,
      cta_label: next.cta_label,
      cta_url: next.cta_url,
      published: next.published,
    }).eq("id", p.id);
    setSaving(false);
    if (error) { toast.error(error.code === "23505" ? "That slug is already taken — try another." : error.message); return false; }
    setP(next);
    return true;
  };

  const publishToggle = async () => {
    const ok = await save({ published: !p.published });
    if (ok) toast.success(p.published ? "Unpublished" : "Published — your product is live!");
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${product.profile_id}/products/${p.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await uploadImage(f);
    if (url) update({ cover_image: url });
  };

  const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = (await Promise.all(files.map(uploadImage))).filter(Boolean) as string[];
    if (urls.length) update({ gallery: [...(p.gallery ?? []), ...urls] });
  };

  const removeGalleryImage = (url: string) => update({ gallery: (p.gallery ?? []).filter((u) => u !== url) });

  const copyLink = () => { navigator.clipboard.writeText(publicUrl); toast.success("Link copied!"); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={async () => { await save(); onClose(); }}>← Back to products</Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{saving ? "Saving…" : "Saved"}</span>
          <Button variant="outline" onClick={() => save()}>Save</Button>
          <Button variant={p.published ? "outline" : "hero"} onClick={publishToggle}>
            {p.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {p.published && (
        <Card className="flex flex-wrap items-center gap-3 border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <ExternalLink className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Your product is live</p>
            <p className="truncate text-xs text-muted-foreground">{publicUrl}</p>
          </div>
          <Button size="sm" variant="outline" onClick={copyLink}><Copy className="h-4 w-4" /> Copy</Button>
          <Button size="sm" variant="outline" asChild><a href={publicUrl} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /> View</a></Button>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold">Basics</h2>
            <div className="grid gap-4">
              <div>
                <Label>Title</Label>
                <Input className="mt-1.5" value={p.title} onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">/p/{username}/</span>
                  <Input value={p.slug} onChange={(e) => update({ slug: slugify(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Tagline</Label>
                <Input className="mt-1.5" value={p.tagline ?? ""} onChange={(e) => update({ tagline: e.target.value })} placeholder="Short one-liner" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea className="mt-1.5" rows={6} value={p.description ?? ""} onChange={(e) => update({ description: e.target.value })} placeholder="Tell the story. Markdown-style line breaks supported." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Price (optional)</Label>
                  <Input className="mt-1.5" value={p.price ?? ""} onChange={(e) => update({ price: e.target.value })} placeholder="$29 or Free" />
                </div>
                <div>
                  <Label>CTA label</Label>
                  <Input className="mt-1.5" value={p.cta_label ?? ""} onChange={(e) => update({ cta_label: e.target.value })} placeholder="Buy now" />
                </div>
              </div>
              <div>
                <Label>CTA URL</Label>
                <Input className="mt-1.5" value={p.cta_url ?? ""} onChange={(e) => update({ cta_url: e.target.value })} placeholder="https://…" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold">Cover image</h2>
            {p.cover_image ? (
              <div className="relative overflow-hidden rounded-xl">
                <img src={p.cover_image} alt="cover" className="aspect-video w-full object-cover" />
                <Button size="sm" variant="outline" className="absolute right-2 top-2" onClick={() => update({ cover_image: null })}>
                  <X className="h-4 w-4" /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                <ImagePlus className="h-8 w-8" />
                <span className="mt-2 text-sm font-medium">Upload cover</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
              </label>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Gallery</h2>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> Add images
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
              </label>
            </div>
            {(p.gallery?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No images yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {p.gallery.map((url) => (
                  <div key={url} className="group relative overflow-hidden rounded-lg">
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
                    <button onClick={() => removeGalleryImage(url)} className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" /> Delete product
            </Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">Preview</div>
            <ProductPreview p={p} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProductPreview({ p }: { p: Product }) {
  return (
    <div className="space-y-3 p-4">
      {p.cover_image && <img src={p.cover_image} alt="" className="aspect-video w-full rounded-lg object-cover" />}
      <h3 className="text-lg font-bold">{p.title || "Untitled"}</h3>
      {p.tagline && <p className="text-sm text-muted-foreground">{p.tagline}</p>}
      {p.price && <p className="text-base font-bold text-primary">{p.price}</p>}
      {p.description && <p className="whitespace-pre-wrap text-sm">{p.description}</p>}
      {p.cta_label && p.cta_url && (
        <Button variant="hero" className="w-full">{p.cta_label}</Button>
      )}
    </div>
  );
}
