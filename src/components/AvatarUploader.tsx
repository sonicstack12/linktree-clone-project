import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  avatarUrl: string | null;
  username: string;
  onChange: (url: string | null) => void;
}

const OUTPUT_SIZE = 512;

export function AvatarUploader({ userId, avatarUrl, username, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please pick an image under 8 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, area: Area) => setCroppedArea(area), []);

  const save = async () => {
    if (!src || !croppedArea) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(src, croppedArea);
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success("Avatar updated!");
      setSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    onChange(null);
    toast.success("Avatar removed");
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="h-20 w-20 rounded-full object-cover shadow-card ring-2 ring-border"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-muted text-2xl font-bold text-muted-foreground ring-2 ring-border">
              {username[0]?.toUpperCase()}
            </div>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background shadow-pop transition-pop hover:scale-110"
            aria-label="Change avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Upload photo
          </Button>
          {avatarUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={remove}>
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>

      <Dialog open={!!src} onOpenChange={(o) => !o && setSrc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop your avatar</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
            {src && (
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">Zoom</div>
            <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSrc(null)} disabled={saving}>Cancel</Button>
            <Button variant="hero" onClick={save} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving</> : "Save avatar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

async function getCroppedBlob(imageSrc: string, area: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Blob failed"))), "image/jpeg", 0.9);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
