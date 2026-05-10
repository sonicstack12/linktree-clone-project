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
import {
  GripVertical, Plus, Trash2, ExternalLink, Link2, Heading, ChevronDown, Calendar, Github, MessageCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { ProfilePreview } from "@/components/ProfilePreview";
import { SocialLinksEditor } from "@/components/SocialLinksEditor";
import { AvatarUploader } from "@/components/AvatarUploader";

export const Route = createFileRoute("/admin/")({
  component: LinksEditor,
});

type LinkType = "link" | "header" | "github_stats" | "discord_stats";

interface LinkRow {
  id: string;
  title: string;
  url: string;
  position: number;
  enabled: boolean;
  type: LinkType;
  start_at: string | null;
  end_at: string | null;
  bento_size: string;
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

const BLOCK_TYPES: { id: LinkType; name: string; icon: typeof Link2; defaults: Partial<LinkRow> }[] = [
  { id: "link", name: "Link", icon: Link2, defaults: { title: "New link", url: "https://" } },
  { id: "header", name: "Section header", icon: Heading, defaults: { title: "Section title", url: "" } },
  
  { id: "github_stats", name: "GitHub live stats", icon: Github, defaults: { title: "Follow me on GitHub", url: "https://github.com/yourname" } },
  { id: "discord_stats", name: "Discord live stats", icon: MessageCircle, defaults: { title: "Join the Discord", url: "https://discord.gg/yourcode" } },
];

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

  const addBlock = async (type: LinkType) => {
    if (!user) return;
    const def = BLOCK_TYPES.find((b) => b.id === type)!.defaults;
    const { data, error } = await supabase
      .from("links")
      .insert({
        profile_id: user.id,
        title: def.title ?? "Untitled",
        url: def.url ?? "",
        type,
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
          <div className="space-y-5">
            <AvatarUploader
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              username={profile.username}
              onChange={(url) => updateProfile({ avatar_url: url })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Display name</Label>
                <Input className="mt-1.5" value={profile.display_name ?? ""} onChange={(e) => updateProfile({ display_name: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea className="mt-1.5" rows={2} value={profile.bio ?? ""} onChange={(e) => updateProfile({ bio: e.target.value })} placeholder="Tell visitors who you are" />
              </div>
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                Your link: <span className="font-mono text-foreground">{typeof window !== "undefined" ? window.location.origin : ""}/u/{profile.username}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Social links */}
        <SocialLinksEditor profileId={profile.id} />

        {/* Add block dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="hero" size="lg" className="w-full" data-tour="add-block">
              <Plus className="h-5 w-5" /> Add block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {BLOCK_TYPES.map((b) => (
              <DropdownMenuItem key={b.id} onClick={() => addBlock(b.id)}>
                <b.icon className="h-4 w-4" /> {b.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Links list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {links.length === 0 && (
                <Card className="p-10 text-center text-muted-foreground shadow-card">
                  No blocks yet. Add your first one above.
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

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  return v ? new Date(v).toISOString() : null;
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

  const meta = BLOCK_TYPES.find((b) => b.id === link.type) ?? BLOCK_TYPES[0];
  const Icon = meta.icon;
  const hasSchedule = !!(link.start_at || link.end_at);

  return (
    <Card ref={setNodeRef} style={style} className="p-4 shadow-card">
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            value={link.title}
            onChange={(e) => onChange(link.id, { title: e.target.value })}
            placeholder={link.type === "header" ? "Section title" : "Title"}
            className="border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0"
          />
          {(link.type === "link" || link.type === "github_stats" || link.type === "discord_stats") && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={link.url}
                onChange={(e) => onChange(link.id, { url: e.target.value })}
                placeholder={
                  link.type === "github_stats" ? "github.com/yourname or just 'yourname'"
                  : link.type === "discord_stats" ? "discord.gg/yourcode"
                  : "https://..."
                }
                className="border-0 px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={link.enabled} onCheckedChange={(v) => onChange(link.id, { enabled: v })} />
          <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <Collapsible>
        <CollapsibleTrigger className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Schedule & layout
          {hasSchedule && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Active</span>}
          <ChevronDown className="h-3 w-3" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Show from</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(link.start_at)}
                onChange={(e) => onChange(link.id, { start_at: fromLocalInput(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Hide after</Label>
              <Input
                type="datetime-local"
                value={toLocalInput(link.end_at)}
                onChange={(e) => onChange(link.id, { end_at: fromLocalInput(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          {link.type === "link" && (
            <div>
              <Label className="text-xs">Bento tile size (when bento layout is enabled)</Label>
              <div className="mt-1.5 flex gap-2">
                {(["1x1", "2x1", "2x2"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange(link.id, { bento_size: s })}
                    className={`flex-1 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-pop ${(link.bento_size ?? "1x1") === s ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
