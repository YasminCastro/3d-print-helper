"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function JournalPhotoPicker({
  files,
  onFilesChange,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files;
    if (!selected || selected.length === 0) return;
    onFilesChange([...files, ...Array.from(selected)]);
    event.target.value = "";
  }

  function handleRemove(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt=""
                className="size-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-1 right-1 opacity-0 transition group-hover:opacity-100"
                onClick={() => handleRemove(index)}
              >
                <XIcon />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          Adicionar fotos
        </Button>
      </div>
    </div>
  );
}
