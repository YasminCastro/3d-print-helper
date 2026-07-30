"use client";

import { useRef, useTransition } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import {
  addJournalPhotosAction,
  deleteJournalPhotoAction,
} from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import type { JournalPhoto } from "@/lib/types/journal";

export function JournalPhotos({
  entryId,
  photos,
}: {
  entryId: number;
  photos: JournalPhoto[];
}) {
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("photos", file);
    }

    startTransition(async () => {
      await addJournalPhotosAction(entryId, formData);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete(photoId: number) {
    startTransition(async () => {
      await deleteJournalPhotoAction(photoId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-md border"
            >
              <a
                href={`/uploads/journal/${photo.filename}`}
                target="_blank"
                rel="noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/uploads/journal/${photo.filename}`}
                  alt=""
                  className="size-full object-cover"
                />
              </a>
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute top-1 right-1 opacity-0 transition group-hover:opacity-100"
                onClick={() => handleDelete(photo.id)}
                disabled={isPending}
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
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          {isPending ? "Enviando..." : "Adicionar fotos"}
        </Button>
      </div>
    </div>
  );
}
