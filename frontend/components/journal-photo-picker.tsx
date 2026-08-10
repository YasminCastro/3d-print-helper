"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";

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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <AttachmentGroup>
        {files.map((file, index) => (
          <Attachment
            key={`${file.name}-${file.lastModified}-${index}`}
            orientation="vertical"
            state="done"
          >
            <AttachmentMedia variant="image">
              {previews[index] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[index]} alt="" />
              )}
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction onClick={() => handleRemove(index)}>
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}

        <Attachment orientation="vertical" state="idle">
          <AttachmentMedia variant="icon">
            <ImagePlusIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Adicionar fotos</AttachmentTitle>
          </AttachmentContent>
          <AttachmentTrigger onClick={() => inputRef.current?.click()} />
        </Attachment>
      </AttachmentGroup>
    </div>
  );
}
