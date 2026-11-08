import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md";
  className?: string;
};

const LABELS = ["", "不急", "一般", "重要", "很重要", "最重要"];

export function StarRating({ value, onChange, size = "sm", className }: Props) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const iconSize = size === "md" ? "size-7" : "size-4";

  if (!onChange) {
    return (
      <span
        className={cn("inline-flex items-center gap-0.5", className)}
        aria-label={`优先级 ${value} 星`}
        title={`优先级：${LABELS[value]}`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(iconSize, i <= value ? "fill-star text-star" : "text-star-empty")}
          />
        ))}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="radiogroup"
        aria-label="优先级"
        className="inline-flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} 星`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(iconSize, i <= shown ? "fill-star text-star" : "text-star-empty")}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{LABELS[shown]}</span>
    </div>
  );
}
