"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon } from "lucide-react";

import {
  deleteJournalEntryAction,
  updateJournalEntryAction,
} from "@/lib/actions/journal";
import {
  journalFormSchema,
  type JournalFormInput,
} from "@/lib/schemas/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";
import { cn } from "@/lib/utils";
import type { FilamentOption } from "@/lib/types/filament";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { JournalPhotos } from "@/components/journal-photos";
import {
  JournalFormFields,
  journalStatusColors,
  journalStatusLabels,
} from "@/components/journal-form-fields";
import type { journalStatusOptions } from "@/lib/schemas/journal";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

function toFormValues(entry: JournalEntryWithDetails): JournalFormInput {
  return {
    title: entry.title,
    entryDate: entry.entry_date ?? "",
    filamentId: entry.filament_id != null ? String(entry.filament_id) : "",
    status: (entry.status as JournalFormInput["status"]) ?? undefined,
    symptom: entry.symptom ?? "",
    possibleCauses: entry.possible_causes ?? "",
    attempts: entry.attempts.map((attempt) => ({
      attempt: attempt.attempt ?? "",
      worked: attempt.worked === null ? undefined : Boolean(attempt.worked),
    })),
    notes: entry.notes ?? "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

export function JournalDetailsDialog({
  entry,
  filamentOptions,
  open,
  onOpenChange,
}: {
  entry: JournalEntryWithDetails;
  filamentOptions: FilamentOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<JournalFormInput>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: toFormValues(entry),
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      form.reset(toFormValues(entry));
    }
  }, [open, entry, form]);

  function onSubmit(values: JournalFormInput) {
    startTransition(async () => {
      await updateJournalEntryAction(entry.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteJournalEntryAction(entry.id);
      onOpenChange(false);
    });
  }

  const status = entry.status as
    | (typeof journalStatusOptions)[number]
    | null;
  const attempts = entry.attempts.filter((a) => a.attempt || a.worked !== null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Entrada" : entry.title}</DialogTitle>
          {!isEditing && (
            <DialogDescription>
              Informações cadastradas da entrada do diário.
            </DialogDescription>
          )}
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <JournalFormFields form={form} filamentOptions={filamentOptions} />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  form.reset(toFormValues(entry));
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Data</dt>
                <dt className="text-muted-foreground">Status</dt>
                <dd>{formatDate(entry.entry_date)}</dd>
                <dd className={status ? journalStatusColors[status] : undefined}>
                  {status ? journalStatusLabels[status] : "—"}
                </dd>
              </div>

              <Separator className="col-span-2" />

              <dt className="text-muted-foreground">Filamento</dt>
              <dd className="flex items-center gap-2">
                {entry.filament_color && (
                  <span
                    className="size-4 shrink-0 rounded-full border"
                    style={{ backgroundColor: entry.filament_color }}
                  />
                )}
                {entry.filament_name ?? "—"}
              </dd>

              {entry.symptom && (
                <>
                  <dt className="text-muted-foreground">Sintoma</dt>
                  <dd className="whitespace-pre-wrap">{entry.symptom}</dd>
                </>
              )}

              {entry.possible_causes && (
                <>
                  <dt className="text-muted-foreground">Possíveis causas</dt>
                  <dd className="whitespace-pre-wrap">{entry.possible_causes}</dd>
                </>
              )}

              {attempts.length > 0 && (
                <>
                  <div className="col-span-2 flex items-center gap-2 py-1">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      O que foi testado
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {attempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className={cn(
                          "relative rounded-lg border p-3 pr-9 whitespace-pre-wrap",
                          attempt.worked === 1 &&
                            "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
                          attempt.worked === 0 &&
                            "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                        )}
                      >
                        {attempt.attempt || "—"}
                        {attempt.worked === 1 && (
                          <ThumbsUpIcon className="absolute top-2 right-2 size-4 text-green-600 dark:text-green-400" />
                        )}
                        {attempt.worked === 0 && (
                          <ThumbsDownIcon className="absolute top-2 right-2 size-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {entry.notes && (
                <>
                  <dt className="text-muted-foreground">Notas</dt>
                  <dd className="whitespace-pre-wrap">{entry.notes}</dd>
                </>
              )}
            </dl>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 py-1">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">Fotos</span>
                <Separator className="flex-1" />
              </div>
              <JournalPhotos entryId={entry.id} photos={entry.photos} />
            </div>

            <DialogFooter className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button type="button" variant="destructive" />}
                >
                  <Trash2Icon />
                  Excluir
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir entrada?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. A entrada do diário será
                      removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isPending}
                      onClick={onDelete}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="button" onClick={() => setIsEditing(true)}>
                <PencilIcon />
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
