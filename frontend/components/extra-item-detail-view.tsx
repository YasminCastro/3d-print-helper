"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";

import {
  deleteExtraItemAction,
  updateExtraItemAction,
} from "@/lib/actions/extra-items";
import { extraItemFormSchema, type ExtraItemFormInput } from "@/lib/schemas/extra-item";
import type { ExtraItem } from "@/lib/types/extra-item";
import { Button } from "@/components/ui/button";
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
import { ExtraItemFormFields } from "@/components/extra-item-form-fields";
import { PrinterStatCard } from "@/components/printer-stat-card";
import { accentFor } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function toFormValues(extraItem: ExtraItem): ExtraItemFormInput {
  return {
    name: extraItem.name,
    cost: extraItem.cost,
  };
}

export function ExtraItemDetailView({ extraItem }: { extraItem: ExtraItem }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExtraItemFormInput>({
    resolver: zodResolver(extraItemFormSchema),
    defaultValues: toFormValues(extraItem),
  });

  function onSubmit(values: ExtraItemFormInput) {
    startTransition(async () => {
      await updateExtraItemAction(extraItem.id, values);
      setIsEditing(false);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteExtraItemAction(extraItem.id);
      router.push("/extra-items");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/extra-items"
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
                  <AlertDialogTitle>Excluir item extra?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O item &quot;{extraItem.name}
                    &quot; será removido permanentemente.
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
              <h1 className="text-xl font-semibold">Editar item extra</h1>
              <p className="text-sm text-muted-foreground">{extraItem.name}</p>
            </div>
          </div>

          <Card>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <ExtraItemFormFields form={form} />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset(toFormValues(extraItem));
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 rounded-xl bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 ring-1 ring-foreground/10">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${accentFor(extraItem.id)}`}
            >
              <ShoppingBagIcon className="size-7" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{extraItem.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <PrinterStatCard
              icon={ShoppingBagIcon}
              label="Valor unitário"
              value={currencyFormatter.format(extraItem.cost)}
              color="chart-4"
            />
          </div>
        </>
      )}
    </div>
  );
}
