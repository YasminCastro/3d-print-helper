"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { logoutAction } from "@/lib/actions/auth";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      toast.success("Você saiu da sua conta.");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <SidebarMenuButton onClick={handleLogout} disabled={isPending} tooltip="Sair">
      <LogOut />
      <span>{isPending ? "Saindo..." : "Sair"}</span>
    </SidebarMenuButton>
  );
}
