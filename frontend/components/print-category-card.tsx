"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  deletePrintCategoryAction,
  updatePrintCategoryAction,
} from "@/lib/actions/print-categories";
import { printCategoryFormSchema, type PrintCategoryFormInput } from "@/lib/schemas/print-category";
import type { PrintCategory } from "@/lib/types/print-category";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PrintCategoryFormFields } from "@/components/print-category-form-fields";
import { accentFor, getErrorMessage } from "@/lib/utils";

function toFormValues(category: PrintCategory): PrintCategoryFormInput {
  return {
    name: category.name,
    color: category.color ?? "",
  };
}

export function PrintCategoryCard({ category }: { category: PrintCategory }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PrintCategoryFormInput>({
    resolver: zodResolver(printCategoryFormSchema),
    defaultValues: toFormValues(category),
  });

  function onSubmit(values: PrintCategoryFormInput) {
    startTransition(async () => {
      try {
        await updatePrintCategoryAction(category.id, values);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível atualizar a categoria"));
        return;
      }
      setOpen(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      try {
        await deletePrintCategoryAction(category.id);
      } catch (error) {
        toast.error(getErrorMessage(error, "Não foi possível excluir a categoria"));
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) form.reset(toFormValues(category));
      }}
    >
      <DialogTrigger
        nativeButton={false}
        render={
          <Card className="flex h-full cursor-pointer flex-col gap-3 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40" />
        }
      >
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${category.color ? "" : accentFor(category.id)}`}
            style={
              category.color
                ? { backgroundColor: `${category.color}26`, color: category.color }
                : undefined
            }
          >
            <TagIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{category.name}</CardTitle>
          </div>
        </CardHeader>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
          <DialogDescription>Atualize o nome e a cor dessa categoria.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <PrintCategoryFormFields form={form} />
          <DialogFooter className="mt-4 items-center sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button type="button" variant="ghost" size="icon-sm" />}
              >
                <Trash2Icon />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. A categoria &quot;{category.name}
                    &quot; será removida permanentemente e as impressões associadas ficarão sem
                    categoria.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" disabled={isPending} onClick={onDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
