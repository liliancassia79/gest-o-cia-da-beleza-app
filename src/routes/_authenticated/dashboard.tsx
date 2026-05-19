import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAppointments } from "@/lib/salon.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Clock, TrendingUp } from "lucide-react";
import { format, isToday, isThisWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { statusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Cia da Beleza" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetchAppts = useServerFn(listAppointments);
  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => fetchAppts(),
  });

  const today = appts.filter((a) => isToday(parseISO(a.starts_at)));
  const week = appts.filter((a) => isThisWeek(parseISO(a.starts_at), { weekStartsOn: 1 }));
  const revenueWeek = week
    .filter((a) => a.status !== "cancelado")
    // @ts-ignore relação
    .reduce((acc, a) => acc + Number(a.services?.price ?? 0), 0);
  const upcoming = appts
    .filter((a) => parseISO(a.starts_at) >= new Date() && a.status !== "cancelado")
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
          <h1 className="text-3xl font-display text-primary">Painel</h1>
        </div>
        <Link to="/agenda" className="text-sm text-accent hover:underline">Ver agenda completa →</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={CalendarDays} label="Hoje" value={today.length} hint="agendamentos" />
        <Stat icon={Clock} label="Esta semana" value={week.length} hint="agendamentos" />
        <Stat icon={TrendingUp} label="Confirmados hoje" value={today.filter((a) => a.status === "confirmado").length} hint="prontos" />
        <Stat icon={DollarSign} label="Previsto na semana" value={`R$ ${revenueWeek.toFixed(2)}`} hint="faturamento" />
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl mb-4">Próximos agendamentos</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum agendamento futuro. <Link to="/agenda" className="text-accent">Criar um</Link>.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{a.client_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {/* @ts-ignore */}
                    {a.services?.name ?? "Serviço"} · {/* @ts-ignore */}
                    {a.professionals?.name ?? "Profissional"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{format(parseISO(a.starts_at), "dd/MM HH:mm")}</div>
                  <Badge className={statusBadge(a.status)} variant="outline">{a.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: any; label: string; value: any; hint: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-display text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}
