"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2,
  ImagesIcon,
  Layers,
  LightbulbIcon,
  NotebookTextIcon,
  PencilIcon,
  StethoscopeIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteJournalEntryAction,
  updateJournalEntryAction,
} from "@/lib/actions/journal";
import {
  journalFormSchema,
  type JournalFormInput,
} from "@/lib/schemas/journal";
import type { JournalEntryWithDetails } from "@/lib/types/journal";
import { cn, getErrorMessage } from "@/lib/utils";
import type { FilamentOption } from "@/lib/types/filament";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
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
import { JournalPhotos } from "@/components/journal-photos";
import {
  JournalFormFields,
  journalStatusLabels,
} from "@/components/journal-form-fields";
import type { journalStatusOptions } from "@/lib/schemas/journal";
import { PrinterStatCard, type StatColor } from "@/components/printer-stat-card";

const statusIcons: Record<(typeof journalStatusOptions)[number], typeof CheckCircle2> = {
  resolvido: CheckCircle2,
  nao_resolvido: XCircle,
  em_andamento: AlertTriangle,
};

const statusStatColors: Record<(typeof journalStatusOptions)[number], StatColor> = {
  resolvido: "green",
  nao_resolvido: "red",
  em_andamento: "yellow",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

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

export function JournalDetailView({
  entry,
  filamentOptions,
}: {
  entry: JournalEntryWithDetails;
  filamentOptions: FilamentOption[];
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<JournalFormInput>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: toFormValues(entry),
  });

  function onSubmit(values: JournalFormInput) {
    startTransition(async () => {
      try {
        await updateJournalEntryAction(entry.id, values);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível atualizar a entrada do diário"));
        return;
      }
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deleteJournalEntryAction(entry.id);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir a entrada do diário"));
        return;
      }
      router.push("/journal");
    });
  }

  const status = entry.status as (typeof journalStatusOptions)[number] | null;
  const attempts = entry.attempts.filter((a) => a.attempt || a.worked !== null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/journal"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Voltar
        </Link>

        {!isEditing && (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" />}
              >
                <Trash2Icon />
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
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <PencilIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">Editar entrada</h1>
              <p className="text-sm text-muted-foreground">{entry.title}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <JournalFormFields form={form} filamentOptions={filamentOptions} />
                <div className="mt-4 flex justify-end gap-2">
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
                    {isPending && <Spinner />}
                    {isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl p-5 ring-1 ring-foreground/10",
              !entry.filament_color && "bg-linear-to-br from-primary/15 via-primary/5 to-transparent"
            )}
            style={
              entry.filament_color
                ? {
                    background: `linear-gradient(to bottom right, ${entry.filament_color}26, ${entry.filament_color}0d, transparent)`,
                  }
                : undefined
            }
          >
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"
              style={
                entry.filament_color
                  ? { backgroundColor: `${entry.filament_color}26`, color: entry.filament_color }
                  : undefined
              }
            >
              <NotebookTextIcon className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{entry.title}</h1>
              {entry.filament_name && (
                <p className="truncate text-sm text-muted-foreground">{entry.filament_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <PrinterStatCard
              icon={CalendarIcon}
              label="Data"
              color="chart-3"
              value={formatDate(entry.entry_date)}
            />
            <PrinterStatCard
              icon={status ? statusIcons[status] : CheckCircle2}
              label="Status"
              color={status ? statusStatColors[status] : "chart-2"}
              value={status ? journalStatusLabels[status] : "—"}
            />
            <PrinterStatCard
              icon={Layers}
              label="Filamento"
              color="chart-1"
              value={
                <span className="flex items-center gap-2">
                  {entry.filament_color && (
                    <span
                      className="size-4 shrink-0 rounded-full border"
                      style={{ backgroundColor: entry.filament_color }}
                    />
                  )}
                  {entry.filament_name ?? "—"}
                </span>
              }
            />
          </div>

          {entry.symptom && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-4/15 text-chart-4">
                  <StethoscopeIcon className="size-3.5" />
                </span>
                Sintoma
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {entry.symptom}
              </p>
            </div>
          )}

          {entry.possible_causes && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-5/15 text-chart-5">
                  <LightbulbIcon className="size-3.5" />
                </span>
                Possíveis causas
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {entry.possible_causes}
              </p>
            </div>
          )}

          {attempts.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-2/15 text-chart-2">
                  <ThumbsUpIcon className="size-3.5" />
                </span>
                O que foi testado
              </div>
              <div className="flex flex-col gap-2">
                {attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className={cn(
                      "relative rounded-lg border p-3 pr-9 text-sm whitespace-pre-wrap",
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
            </div>
          )}

          {entry.notes && (
            <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-1/15 text-chart-1">
                  <NotebookTextIcon className="size-3.5" />
                </span>
                Notas
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {entry.notes}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-chart-3/15 text-chart-3">
                <ImagesIcon className="size-3.5" />
              </span>
              Fotos
            </div>
            <JournalPhotos entryId={entry.id} photos={entry.photos} />
          </div>
        </>
      )}
    </div>
  );
}
