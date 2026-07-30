"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintPhotoPicker({
  file,
  onFileChange,
  existingPhotoUrl,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  existingPhotoUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = preview ?? existingPhotoUrl ?? null;

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) onFileChange(selected);
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      {displayUrl && (
        <div className="group relative aspect-video w-full max-w-xs overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt="" className="size-full object-cover" />
          {file && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute top-1 right-1 opacity-0 transition group-hover:opacity-100"
              onClick={() => onFileChange(null)}
            >
              <XIcon />
            </Button>
          )}
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          {displayUrl ? "Trocar foto" : "Adicionar foto"}
        </Button>
      </div>
    </div>
  );
}
