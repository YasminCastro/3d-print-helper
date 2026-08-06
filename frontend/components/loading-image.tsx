"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingImage({
  src,
  alt = "",
  className,
  imgClassName,
}: {
  src: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        ref={(img) => {
          if (img?.complete) setLoaded(true);
        }}
        onLoad={() => setLoaded(true)}
        className={cn(
          "size-full opacity-0 transition-opacity duration-200",
          loaded && "opacity-100",
          imgClassName
        )}
      />
    </div>
  );
}
