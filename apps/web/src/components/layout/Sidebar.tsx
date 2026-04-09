"use client";

import { useAuth } from "@/hooks/useAuth";
import { clsx } from "clsx";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Music2,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Canciones", href: "/songs", icon: Music2 },
  { label: "Reuniones", href: "/meetings", icon: Calendar },
];

const BOTTOM_ITEMS = [
  { label: "Suscripción", href: "/settings/billing", icon: CreditCard },
  { label: "Configuración", href: "/settings", icon: Settings },
];

function isItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getCurrentSectionLabel(pathname: string) {
  const allItems = [...NAV_ITEMS, ...BOTTOM_ITEMS];
  const current = allItems.find((item) => isItemActive(pathname, item.href));
  return current?.label ?? "Panel";
}

function NavigationLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-white text-slate-950 shadow-lg shadow-black/10"
                  : "text-slate-300 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-4 py-5">
        {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isItemActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-white text-slate-950 shadow-lg shadow-black/10"
                  : "text-slate-400 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="relative z-10 hidden w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950 text-slate-100 lg:flex">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-950/30">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block font-semibold tracking-tight text-white">
              SongList
            </span>
            <span className="text-xs text-slate-400">
              Worship team workspace
            </span>
          </div>
        </div>
        {user && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="mt-1 text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
      </div>

      <NavigationLinks pathname={pathname} />

      <div className="space-y-1 border-t border-white/10 px-4 py-5">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <div
        data-print-hide
        className="sticky top-0 z-30 border-b border-white/40 bg-[rgba(251,250,247,0.82)] backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {getCurrentSectionLabel(pathname)}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-900/20">
                <Music2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">SongList</p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.name ?? "Workspace"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-[88vw] max-w-sm flex-col bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-950/30">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block font-semibold tracking-tight text-white">
                  SongList
                </span>
                <span className="text-xs text-slate-400">
                  Worship team workspace
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {user && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="mt-1 text-xs text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>

        <NavigationLinks
          pathname={pathname}
          onNavigate={() => setIsOpen(false)}
        />

        <div className="border-t border-white/10 px-4 py-5">
          <button
            onClick={async () => {
              setIsOpen(false);
              await logout();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
