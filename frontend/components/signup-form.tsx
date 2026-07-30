"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Printer } from "lucide-react";

import { signupAction } from "@/lib/actions/auth";
import { signupFormSchema, type SignupFormInput } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const defaultValues: SignupFormInput = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function SignupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues,
  });

  function onSubmit(values: SignupFormInput) {
    startTransition(async () => {
      const result = await signupAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/login");
    });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Printer className="size-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          3D Print Helper
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  autoComplete="name"
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...form.register("password")}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.confirmPassword}>
              <FieldLabel htmlFor="confirm-password">Confirmar senha</FieldLabel>
              <FieldContent>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
                <FieldError errors={[form.formState.errors.confirmPassword]} />
              </FieldContent>
            </Field>

            <Button type="submit" className="mt-2 w-full" disabled={isPending}>
              {isPending ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <span className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
