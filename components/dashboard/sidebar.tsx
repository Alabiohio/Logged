"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Settings, FileText, LogOut, Code, Activity, X, ChevronLeft, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Sidebar({
  mobileOpen,
  drawerVisible,
  closeMenu
}: {
  mobileOpen: boolean;
  drawerVisible: boolean;
  closeMenu: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { name: "Activity", href: "/dashboard/activity", icon: Activity },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Documentation", href: "/docs", icon: FileText },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`relative hidden h-full border-r border-border bg-background-secondary/70 backdrop-blur-xl lg:flex lg:flex-col shrink-0 transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`}>
        <div className={`flex h-16 shrink-0 items-center border-b border-border transition-all duration-300 ${isCollapsed ? "justify-center" : "px-6"}`}>
          <div className="flex items-center">
            <Image src="/logo/logo.png" alt="Oheo logo" width={1000} height={20} className={`relative w-9 h-9 object-contain ${isCollapsed ? "" : "mr-2"}`} />
            {!isCollapsed && <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl ml-2 whitespace-nowrap overflow-hidden">Logged</span>}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background-secondary text-text-secondary hover:text-text hover:bg-glass transition shadow-sm z-10"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`group flex items-center rounded-2xl py-3 text-sm font-medium transition ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                    } ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-glass hover:text-text"
                    }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text"}`}
                  />
                  {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border p-4 shrink-0">
          <button
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`group flex w-full items-center rounded-2xl border border-border bg-glass py-3 text-sm font-medium text-text-secondary transition hover:bg-glass-hover hover:text-text ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"
              }`}
          >
            <LogOut className="h-5 w-5 text-text-secondary group-hover:text-text" />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeMenu} />
          <aside className={`relative z-10 flex h-full w-72 flex-col overflow-y-auto border-r border-border bg-background-secondary/95 p-4 backdrop-blur-xl transition-transform duration-200 ease-out ${drawerVisible ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex shrink-0 items-center justify-between px-2 pb-6">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="relative flex items-center group shrink-0"
                >
                  <Image src="/logo/logo.png" alt="Oheo logo" width={1000} height={20} className="relative w-9 h-9 object-contain" />
                  <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl ml-2">Logged</span>
                </Link>
              </div>
              <button
                onClick={closeMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-glass text-text-secondary transition hover:bg-glass-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2 px-2 flex-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMenu}
                    className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-glass hover:text-text"
                      }`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text"}`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border pt-4 shrink-0">
              <button
                onClick={() => {
                  closeMenu();
                  handleSignOut();
                }}
                className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-glass px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-glass-hover hover:text-text"
              >
                <LogOut className="h-5 w-5 text-text-secondary group-hover:text-text" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
