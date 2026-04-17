import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ProfilePreview } from "@/components/ProfilePreview";
import { SocialLinksEditor } from "@/components/SocialLinksEditor";

export const Route = createFileRoute("/admin/")({
  component: LinksEditor,
});

interface LinkRow {
  id: string;
  title: string;
  url: string;
  position: number;
  enabled: boolean;
}

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  button_style: string;
}

function LinksEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("links").select("*").eq("profile_id", user.id).order("position"),
    ]).then(([p, l]) => {
      if (p.data) setProfile(p.data as ProfileRow);
      if (l.data) setLinks(l.data as LinkRow[]);
      setLoading(false);
    });
  }, [user]);

  const updateProfile = async (patch: Partial<ProfileRow>) => {
    if (!profile) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    await supabase.from("profiles").update(patch).eq("id", profile.id);
  };

  const addLink = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: user.id,
        title: "New link",
        url: "https://",
        position: links.length,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    if (data) setLinks((prev) => [...prev, data as LinkRow]);
  };

  const updateLink = async (id: string, patch: Partial<LinkRow>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await supabase.from("links").update(patch).eq("id", id);
  };

  const deleteLink = async (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await supabase.from("links").delete().eq("id", id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const next = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, position: i }));
    setLinks(next);
    // Persist positions in parallel
    await Promise.all(
      next.map((l) => supabase.from("links").update({ position: l.position }).eq("id", l.id)),
    );
  };

  if (loading || !profile) {
    return <div className="grid h-64 place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Editor */}
      <div className="space-y-6">
        {/* Profile card */}
        <Card className="p-6 shadow-card">
          <h2 className="mb-4 text-lg font-bold">Your profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Display name</Label>
              <Input className="mt-1.5" value={profile.display_name ?? ""} onChange={(e) => updateProfile({ display_name: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Bio</Label>
              <Textarea className="mt-1.5" rows={2} value={profile.bio ?? ""} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="Tell visitors who you are" />
            </div>
            <div className="sm:col-span-2">
              <Label>Avatar URL</Label>
              <Input className="mt-1.5" value={profile.avatar_url ?? ""} onChange={(e) => updateProfile({ avatar_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2 text-xs text-muted-foreground">
              Your link: <span className="font-mono text-foreground">{typeof window !== "undefined" ? window.location.origin : ""}/u/{profile.username}</span>
            </div>
          </div>
        </Card>

        {/* Social links */}
        <SocialLinksEditor profileId={profile.id} />

        {/* Add link */}
        <Button onClick={addLink} variant="hero" size="lg" className="w-full">
          <Plus className="h-5 w-5" /> Add link
        </Button>

        {/* Links list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.length === 0 && (
                <Card className="p-10 text-center text-muted-foreground shadow-card">
                  No links yet. Add your first one above.
                </Card>
              )}
              {links.map((link) => (
                <SortableLinkRow key={link.id} link={link} onChange={updateLink} onDelete={deleteLink} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProfilePreview profileId={profile.id} />
      </div>
    </div>
  );
}

function SortableLinkRow({
  link,
  onChange,
  onDelete,
}: {
  link: LinkRow;
  onChange: (id: string, patch: Partial<LinkRow>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 shadow-card">
      <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 space-y-2">
        <Input
          value={link.title}
          onChange={(e) => onChange(link.id, { title: e.target.value })}
          placeholder="Title"
          className="border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center gap-2">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={link.url}
            onChange={(e) => onChange(link.id, { url: e.target.value })}
            placeholder="https://..."
            className="border-0 px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={link.enabled} onCheckedChange={(v) => onChange(link.id, { enabled: v })} />
        <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </Card>
  );
}
