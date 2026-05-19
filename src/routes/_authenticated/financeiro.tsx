import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAppointments } from "@/lib/salon.functions";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { format, parseISO, startOfDay, startOfWeek, startOfMonth, isAfter, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, TrendingUp, CalendarRange } from "lucide-react";

type Period = "day" | "week" | "month";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Cia da Beleza" }] }),
  component: FinancePage,
});

function FinancePage() {
  const fetchAppts = useServerFn(listAppointments);
  const { data: appts = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => fetchAppts() });

  const [period, setPeriod] = useState<Period>("week");

  const since = useMemo(() => {
    const now = new Date();
    if (period === "day") return startOfDay(now);
    if (period === "week") return startOfWeek(now, { weekStartsOn: 1 });
    return startOfMonth(now);
  }, [period]);

  const concluded = appts.filter((a: any) => a.status === "concluido");
  const inPeriod = concluded.filter((a: any) => {
    const d = parseISO(a.starts_at);
    return isAfter(d, since) || isEqual(d, since);
  });

  const revenue = inPeriod.reduce((acc: number, a: any) => acc + Number(a.services?.price ?? 0), 0);
  const ticket = inPeriod.length ? revenue / inPeriod.length : 0;

  const byDay = inPeriod.reduce<Record<string, number>>((acc, a: any) => {
    const k = format(parseISO(a.starts_at), "yyyy-MM-dd");
    acc[k] = (acc[k] ?? 0) + Number(a.services?.price ?? 0);
    return acc;
  }, {});
  const days = Object.entries(byDay).sort(([a], [b]) => (a < b ? 1 : -1));
  const max = Math.max(1, ...Object.values(byDay));

  const periodLabel: Record<Period, string> = { day: "Hoje", week: "Esta semana", month: "Este mês" };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display text-primary">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Receita gerada por agendamentos concluídos</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat icon={DollarSign} label={`Receita · ${periodLabel[period]}`} value={`R$ ${revenue.toFixed(2)}`} />
        <Stat icon={CalendarRange} label="Atendimentos concluídos" value={inPeriod.length} />
        <Stat icon={TrendingUp} label="Ticket médio" value={`R$ ${ticket.toFixed(2)}`} />
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl mb-4">Receita por dia</h2>
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum atendimento concluído no período.</p>
        ) : (
          <ul className="space-y-2">
            {days.map(([day, total]) => (
              <li key={day} className="grid grid-cols-[140px_1fr_110px] items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(day), "EEE, dd/MM", { locale: ptBR })}
                </span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${(total / max) * 100}%` }}
                  />
                </div>
                <span className="text-right font-medium">R$ {total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 text-2xl font-display text-foreground">{value}</div>
    </Card>
  );
}
