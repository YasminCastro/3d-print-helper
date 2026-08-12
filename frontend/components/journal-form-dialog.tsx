"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { addJournalPhotosAction, createJournalEntryAction } from "@/lib/actions/journal";
import {
  journalFormSchema,
  type JournalFormInput,
} from "@/lib/schemas/journal";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { JournalFormFields } from "@/components/journal-form-fields";
import { JournalPhotoPicker } from "@/components/journal-photo-picker";
import type { FilamentOption } from "@/lib/types/filament";

const defaultValues: JournalFormInput = {
  title: "",
  entryDate: "",
  filamentId: "",
  status: undefined,
  symptom: "",
  possibleCauses: "",
  attempts: [],
  notes: "",
};

export function JournalFormDialog({
  filamentOptions,
  trigger,
}: {
  filamentOptions: FilamentOption[];
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const form = useForm<JournalFormInput>({
    resolver: zodResolver(journalFormSchema),
    defaultValues,
  });

  function onSubmit(values: JournalFormInput) {
    startTransition(async () => {
      try {
        const entryId = await createJournalEntryAction(values);

        if (photoFiles.length > 0) {
          const formData = new FormData();
          for (const file of photoFiles) {
            formData.append("photos", file);
          }
          await addJournalPhotosAction(entryId, formData);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível salvar a entrada do diário"));
        return;
      }

      form.reset(defaultValues);
      setPhotoFiles([]);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset(defaultValues);
          setPhotoFiles([]);
        }
      }}
    >
      <DialogTrigger render={trigger ? <button type="button" className="contents" /> : <Button />}>
        {trigger ?? (
          <>
            <PlusIcon />
            Nova Entrada
          </>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Entrada do Diário</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <JournalFormFields form={form} filamentOptions={filamentOptions} />
          <Field className="mt-4">
            <FieldLabel>Fotos</FieldLabel>
            <FieldContent>
              <JournalPhotoPicker files={photoFiles} onFilesChange={setPhotoFiles} />
            </FieldContent>
          </Field>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
