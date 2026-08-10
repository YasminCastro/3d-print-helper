"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRightIcon,
  Gauge,
  Images,
  LayoutDashboard,
  Layers,
  NotebookText,
  Package,
  Printer,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

type NavLeaf = { title: string; url: string; icon: LucideIcon };
type NavGroup = { title: string; icon: LucideIcon; items: NavLeaf[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Impressão",
    icon: Images,
    items: [
      { title: "Impressões", url: "/prints", icon: Images },
      { title: "Categorias", url: "/print-categories", icon: Tags },
      { title: "Diário", url: "/journal", icon: NotebookText },
      { title: "Itens Extras", url: "/extra-items", icon: ShoppingBag },
    ],
  },
  {
    title: "Equipamento",
    icon: Printer,
    items: [
      { title: "Impressoras", url: "/printers", icon: Printer },
      { title: "Filamentos", url: "/filaments", icon: Layers },
      { title: "Marcas", url: "/brands", icon: Package },
    ],
  },
  {
    title: "Calibração",
    icon: Gauge,
    items: [
      { title: "Calibrações", url: "/calibrations", icon: Gauge },
      { title: "Por Fatiador", url: "/slicer-calibration", icon: SlidersHorizontal },
    ],
  },
];

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string } | null;
}) {
  const pathname = usePathname();

  function isActive(url: string) {
    return url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);
  }

  function isGroupActive(group: NavGroup) {
    return group.items.some((item) => isActive(item.url));
  }

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of NAV_GROUPS) {
      initial[group.title] = isGroupActive(group);
    }
    return initial;
  });

  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(isGroupActive);
    if (!activeGroup) return;
    setOpenGroups((prev) =>
      prev[activeGroup.title] ? prev : { ...prev, [activeGroup.title]: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Printer className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Print Helper</span>
                <span className="truncate text-xs text-muted-foreground">
                  Impressão 3D
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Geral</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive("/")}
                tooltip="Início"
                render={<Link href="/" />}
              >
                <LayoutDashboard />
                <span>Início</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_GROUPS.map((group) => (
              <Collapsible
                key={group.title}
                open={openGroups[group.title] ?? false}
                onOpenChange={(open) =>
                  setOpenGroups((prev) => ({ ...prev, [group.title]: open }))
                }
                className="group/collapsible"
                render={<SidebarMenuItem />}
              >
                <CollapsibleTrigger render={<SidebarMenuButton tooltip={group.title} />}>
                  <group.icon />
                  <span>{group.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {group.items.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton
                          isActive={isActive(item.url)}
                          render={<Link href={item.url} />}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser name={user.name} email={user.email} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
