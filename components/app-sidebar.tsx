"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Printer, Sliders, Package, Layers } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "Impressoras", url: "/printers", icon: Printer },
  { title: "Marcas", url: "/brands", icon: Package },
  { title: "Filamentos", url: "/filaments", icon: Layers },
  { title: "Perfis de Impressão", url: "/profiles", icon: Sliders },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Printer className="size-5 shrink-0" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            Print Helper
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
