import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRatingDisplay({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <StarIcon
          key={star}
          className={cn(
            "size-3.5",
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}
