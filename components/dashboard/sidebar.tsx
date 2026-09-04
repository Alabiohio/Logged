"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Settings, FileText, LogOut, Activity, X, ChevronLeft, ChevronRight, ChevronDown, User, Monitor, Database, TriangleAlert, Sun, Moon, Bell, Shield } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

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
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const { theme, setTheme } = useTheme();

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
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 288 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] as const }}
        className="relative hidden h-full border-r border-border bg-background-secondary/70 backdrop-blur-xl lg:flex lg:flex-col shrink-0"
      >
        <div className={`flex h-16 shrink-0 items-center border-b border-border ${isCollapsed ? "justify-center" : "px-6"}`}>
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ rotate: 10 }}>
              <Image src="/logo/logo.png" alt="Oheo logo" width={1000} height={20} className={`relative w-9 h-9 object-contain ${isCollapsed ? "" : "mr-2"}`} />
            </motion.div>
            {!isCollapsed && <span className="text-xl font-black tracking-tight text-text-secondary sm:text-2xl ml-2 whitespace-nowrap overflow-hidden">Logged</span>}
          </Link>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background-secondary text-text-secondary hover:text-text hover:bg-glass transition shadow-sm z-10"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center rounded-2xl py-3 text-sm font-medium transition ${
                    isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                  } ${isActive ? "text-primary font-semibold" : "text-text-secondary hover:text-text"}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActivePill"
                      className="absolute inset-0 rounded-2xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`relative z-10 h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text"}`}
                  />
                  {!isCollapsed && <span className="relative z-10 whitespace-nowrap overflow-hidden">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border p-4 shrink-0 flex flex-col gap-2">
          <div className={`flex gap-1 p-1 rounded-2xl border border-border bg-background-secondary/50 ${isCollapsed ? "flex-col" : "items-center"}`}>
            {(["light", "system", "dark"] as const).map((t) => {
              const icons = { light: Sun, system: Monitor, dark: Moon };
              const Icon = icons[t];
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                  className={`relative flex flex-1 items-center justify-center rounded-xl p-2 transition-all ${
                    active ? "text-primary font-bold" : "text-text-secondary hover:text-text"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="themeActivePill"
                      className="absolute inset-0 rounded-xl bg-primary/15"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                </button>
              );
            })}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : undefined}
            className={`group flex w-full items-center rounded-2xl border border-border bg-glass py-3 text-sm font-medium text-text-secondary transition hover:bg-glass-hover hover:text-text ${
              isCollapsed ? "justify-center px-0" : "gap-3 px-4"
            }`}
          >
            <LogOut className="h-5 w-5 text-text-secondary group-hover:text-text" />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sign Out</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeMenu}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative z-10 flex h-full w-72 flex-col overflow-y-auto border-r border-border bg-background-secondary/95 p-4 backdrop-blur-xl"
            >
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
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                  const isSettings = item.name === "Settings";

                  return (
                    <div key={item.name} className="flex flex-col">
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={closeMenu}
                          className={`group flex flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-text-secondary hover:bg-glass hover:text-text"
                          }`}
                        >
                          <item.icon
                            className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-text-secondary group-hover:text-text"}`}
                          />
                          {item.name}
                        </Link>
                        {isSettings && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setSettingsExpanded(!settingsExpanded);
                            }}
                            className="p-2 ml-2 text-text-secondary hover:text-text focus:outline-none lg:hidden"
                          >
                            {settingsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                      </div>

                      {isSettings && isActive && settingsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-12 mt-1 mb-2 flex flex-col gap-1 overflow-hidden lg:hidden"
                        >
                          {[
                            { id: "profile", label: "Profile", icon: User },
                            { id: "notifications", label: "Notifications", icon: Bell },
                            { id: "security", label: "Security", icon: Shield },
                            { id: "security-sessions", label: "Active Sessions", icon: Monitor, parent: "security" },
                            { id: "account", label: "Account", icon: Database },
                            { id: "danger", label: "Danger", icon: TriangleAlert },
                          ].map((section) => (
                            <Link
                              key={section.id}
                              href={`/dashboard/settings#${section.id}`}
                              onClick={closeMenu}
                              className={`flex items-center gap-2 py-1.5 text-sm transition-colors hover:text-text ${section.parent ? "ml-4 text-text-muted text-xs" : "text-text-secondary"}`}
                            >
                              <section.icon className="h-4 w-4" />
                              {section.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="border-t border-border p-4 shrink-0 flex flex-col gap-2">
                <div className="flex gap-1 p-1 rounded-2xl border border-border bg-background-secondary/50 items-center">
                  {(["light", "system", "dark"] as const).map((t) => {
                    const icons = { light: Sun, system: Monitor, dark: Moon };
                    const Icon = icons[t];
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        title={t.charAt(0).toUpperCase() + t.slice(1)}
                        className={`flex flex-1 items-center justify-center rounded-xl p-2 transition-all ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-glass hover:text-text"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
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
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

