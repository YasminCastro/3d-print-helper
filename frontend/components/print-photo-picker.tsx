"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";

const ACCEPTED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_PHOTO_LABEL = "PNG, JPG ou WEBP";

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
    event.target.value = "";
    if (!selected) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(selected.type)) {
      toast.error(`Tipo de arquivo não suportado. Envie uma imagem ${ACCEPTED_PHOTO_LABEL}.`);
      return;
    }

    onFileChange(selected);
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(",")}
        className="hidden"
        onChange={handleFileSelected}
      />

      <Attachment
        orientation="vertical"
        state={displayUrl ? "done" : "idle"}
        className="w-40"
      >
        <AttachmentMedia variant={displayUrl ? "image" : "icon"}>
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" />
          ) : (
            <ImagePlusIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>
            {displayUrl ? "Trocar foto" : "Adicionar foto"}
          </AttachmentTitle>
          {!displayUrl && (
            <AttachmentDescription>{ACCEPTED_PHOTO_LABEL}</AttachmentDescription>
          )}
        </AttachmentContent>
        <AttachmentTrigger onClick={() => inputRef.current?.click()} />
        {file && (
          <AttachmentActions>
            <AttachmentAction onClick={() => onFileChange(null)}>
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        )}
      </Attachment>
    </div>
  );
}
