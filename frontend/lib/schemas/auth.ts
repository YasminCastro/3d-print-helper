import { z } from "zod";

export const signupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe seu nome")
      .max(100, "O nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail")
      .email("E-mail inválido")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(128, "A senha deve ter no máximo 128 caracteres")
      .refine(
        (password) => /\d/.test(password) && /[a-zA-Z]/.test(password),
        "A senha deve conter ao menos uma letra e um número"
      ),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignupFormInput = z.input<typeof signupFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail")
    .email("E-mail inválido")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginFormInput = z.input<typeof loginFormSchema>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
