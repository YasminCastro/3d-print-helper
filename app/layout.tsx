import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3D Print Helper",
  description: "Gerenciador de configurações de impressão 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm font-medium text-muted-foreground">
                  3D Print Helper
                </span>
              </header>
              <main className="flex flex-1 flex-col gap-4 p-4">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
