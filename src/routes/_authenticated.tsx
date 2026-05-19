import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Scissors, Users, Settings, Wallet } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

const nav = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/servicos", label: "Serviços", icon: Scissors },
  { to: "/profissionais", label: "Profissionais", icon: Users },
  { to: "/configuracoes", label: "Ajustes", icon: Settings },
] as const;

function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-md overflow-hidden border border-border/60">
              <img src={logo} alt="Cia da Beleza" className="h-full w-full object-cover" />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="md:hidden flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 whitespace-nowrap ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
