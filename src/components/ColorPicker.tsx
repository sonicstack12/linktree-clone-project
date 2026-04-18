import { Input } from "@/components/ui/input";

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const isHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s);

export function ColorPicker({ label, value, onChange }: Props) {
  const safe = isHex(value) ? value : "#000000";
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border-2 border-input bg-background p-1.5 focus-within:border-primary">
        <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-border" style={{ background: safe }}>
          <input
            type="color"
            value={safe}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="border-0 font-mono text-sm uppercase shadow-none focus-visible:ring-0"
          maxLength={7}
        />
      </div>
    </div>
  );
}
