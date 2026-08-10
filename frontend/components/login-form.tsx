"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Printer } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import { loginFormSchema, type LoginFormInput } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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

const defaultValues: LoginFormInput = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
  });

  function onSubmit(values: LoginFormInput) {
    setLoginError(null);
    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.success) {
        setLoginError(result.error);
        return;
      }

      toast.success("Login realizado com sucesso!");
      router.push("/");
      router.refresh();
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
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Informe suas credenciais para acessar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  {...form.register("email", {
                    onChange: () => setLoginError(null),
                  })}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register("password", {
                    onChange: () => setLoginError(null),
                  })}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>

            {loginError && (
              <p className="text-sm text-destructive" role="alert">
                {loginError}
              </p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <span className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Criar conta
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
