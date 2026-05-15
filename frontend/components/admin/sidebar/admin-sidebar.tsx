"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  MessageSquare,
  PlaySquare,
  Settings,
  User,
  Package,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Products",
    icon: BookOpen,
    href: "/admin/products",
  },
  {
    title: "Sales",
    icon: MessageSquare,
    href: "/admin/sales",
  },
  {
    title: "Approvals",
    icon: Calendar,
    href: "/admin/approvals",
  },
  {
    title: "Analytics",
    icon: PlaySquare,
    href: "/admin/analytics",
  },
  {
    title: "Categories",
    icon: Package,
    href: "/admin/categories",
  },
];

const settingsItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const token = localStorage.getItem("accessToken");

  const decoded = token
    ? (jwtDecode(token) as {
        name?: string;
        email?: string;
        role?: string;
      })
    : null;

  const menu =
    decoded?.role !== "manager"
      ? menuItems.filter((item) => item.href !== "/admin/approvals")
      : menuItems;

  const userInfo = {
    name: decoded?.name || "Admin User",
    email: decoded?.email || "admin@mosque.org",
    role: decoded?.role || "Administrator",
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Image
              src="/assets/images/Al-furqan_logo.jpg"
              width={32}
              height={32}
              alt="Logo of al-furqan studio"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">inventory</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="rounded-3xl">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      className={`flex items-center gap-3 rounded-3xl p-4 text-sm transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href} className="rounded-3xl">
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      className={`flex items-center gap-3 rounded-3xl p-4 text-sm transition-all ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-3"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-6">
        <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 shadow-sm">
          <Avatar className="size-10">
            <AvatarImage src="" alt={userInfo.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {userInfo.name}
            </p>
            <p className="text-xs text-muted-foreground">{userInfo.email}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              {userInfo.role}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
