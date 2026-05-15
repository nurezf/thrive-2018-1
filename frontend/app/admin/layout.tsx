"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar/admin-sidebar";
import { AdminHeader } from "@/components/admin/header/admin-header";

import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // For login page, only provide AuthProvider without protection

  // For all other admin routes, provide full protection
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex min-h-screen w-full flex-col">
        <AdminHeader />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
