"use client";

import { useRef, useTransition } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import {
  addJournalPhotosAction,
  deleteJournalPhotoAction,
} from "@/lib/actions/journal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { JournalPhoto } from "@/lib/types/journal";
import { getErrorMessage } from "@/lib/utils";

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
      try {
        await addJournalPhotosAction(entryId, formData);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível enviar a foto"));
        return;
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete(photoId: number) {
    startTransition(async () => {
      try {
        await deleteJournalPhotoAction(photoId);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir a foto"));
      }
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
                href={`/journal-photos/${photo.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/journal-photos/${photo.id}`}
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
          {isPending ? <Spinner /> : <ImagePlusIcon />}
          {isPending ? "Enviando..." : "Adicionar fotos"}
        </Button>
      </div>
    </div>
  );
}
