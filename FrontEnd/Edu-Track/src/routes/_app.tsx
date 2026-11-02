import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, GraduationCap, LogOut, Menu } from "lucide-react";
import { useAppLayoutViewModel } from "@/viewmodels/use-app-layout-view-model";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  const { user, unread, items, roleLabel, logout } = useAppLayoutViewModel();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user === null) nav({ to: "/" });
  }, [user, nav]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-sidebar p-4 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center gap-2 px-2 text-lg font-bold text-sidebar-foreground">
          <span className="rounded-xl bg-sidebar-primary p-1.5 text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>{" "}
          EduTrack
        </div>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{
                className:
                  "!bg-sidebar-primary font-semibold !text-sidebar-primary-foreground shadow-sm",
              }}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Link>
          <div className="text-right text-sm leading-tight">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs text-muted-foreground">{roleLabel}</div>
          </div>
          <button
            onClick={() => {
              logout();
              nav({ to: "/" });
            }}
            className="rounded-lg p-2 hover:bg-accent"
            aria-label="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
