"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  Package,
  Layers,
  Gauge,
  NotebookText,
  Images,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "Impressoras", url: "/printers", icon: Printer },
  { title: "Marcas", url: "/brands", icon: Package },
  { title: "Filamentos", url: "/filaments", icon: Layers },
  { title: "Calibrações", url: "/calibrations", icon: Gauge },
  { title: "Diário", url: "/journal", icon: NotebookText },
  { title: "Impressões", url: "/prints", icon: Images },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
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
      {isLoggedIn && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <LogoutButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
