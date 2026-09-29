interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  recommendedMin?: number;
  recommendedMax?: number;
  multiline?: boolean;
}

export function CharCounterInput({ value, onChange, placeholder, recommendedMin, recommendedMax, multiline }: Props) {
  const len = (value ?? "").length;
  const inRange =
    recommendedMin !== undefined && recommendedMax !== undefined
      ? len >= recommendedMin && len <= recommendedMax
      : true;

  const cls = "mt-1 w-full px-3 py-2 rounded-lg bg-foreground/[0.04] border border-foreground/10 text-sm outline-none focus:border-foreground/25";
  return (
    <div>
      {multiline ? (
        <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      ) : (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
      {recommendedMin !== undefined && (
        <div className={"text-[10px] mt-1 " + (inRange ? "text-emerald-400/80" : "text-amber-400/80")}>
          {len} chars · recommended {recommendedMin}–{recommendedMax}
        </div>
      )}
    </div>
  );
}
