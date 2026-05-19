import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAppointments,
  listServices,
  listProfessionals,
  upsertAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "@/lib/salon.functions";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import { format, parseISO, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { statusBadge } from "@/components/status-badge";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda — Cia da Beleza" }] }),
  component: AgendaPage,
});

type Appt = any;

function AgendaPage() {
  const qc = useQueryClient();
  const fetchAppts = useServerFn(listAppointments);
  const fetchServices = useServerFn(listServices);
  const fetchProfs = useServerFn(listProfessionals);

  const { data: appts = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => fetchAppts() });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => fetchServices() });
  const { data: professionals = [] } = useQuery({ queryKey: ["professionals"], queryFn: () => fetchProfs() });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Appt | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = appts.filter((a: Appt) =>
    (statusFilter === "all" || a.status === statusFilter) &&
    (originFilter === "all" || a.origin === originFilter)
  );
  const grouped = filtered.reduce<Record<string, Appt[]>>((acc, a) => {
    const k = format(parseISO(a.starts_at), "yyyy-MM-dd");
    (acc[k] ||= []).push(a);
    return acc;
  }, {});

  const updateStatus = useServerFn(updateAppointmentStatus);
  const remove = useServerFn(deleteAppointment);

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: any }) => updateStatus({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Status atualizado"); },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Agendamento removido"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display text-primary">Agenda</h1>
          <p className="text-sm text-muted-foreground">Gerencie todos os agendamentos do salão</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={originFilter} onValueChange={setOriginFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toda origem</SelectItem>
              <SelectItem value="manual">Do painel</SelectItem>
              <SelectItem value="site">Do site</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />Novo</Button>
            </DialogTrigger>
            <AppointmentDialog
              services={services}
              professionals={professionals}
              editing={editing}
              onClose={() => { setOpen(false); setEditing(null); }}
            />
          </Dialog>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Nenhum agendamento. Clique em "Novo" para começar.
        </Card>
      ) : (
        Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <h2 className="font-display text-lg text-primary mb-2">
              {format(parseISO(day), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <Card className="divide-y divide-border">
              {items.map((a: Appt) => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.client_name}</span>
                      <Badge variant="outline" className={statusBadge(a.status)}>{a.status}</Badge>
                      {a.origin === "site" && (
                        <Badge variant="outline" className="border-accent/40 text-accent">do site</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(a.starts_at), "HH:mm")} – {format(parseISO(a.ends_at), "HH:mm")} ·{" "}
                      {a.services?.name ?? "—"} · {a.professionals?.name ?? "—"}
                      {a.client_phone ? ` · ${a.client_phone}` : ""}
                    </div>
                    {a.notes && <div className="text-xs text-muted-foreground mt-1">{a.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={a.status} onValueChange={(s) => statusMut.mutate({ id: a.id, status: s })}>
                      <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover agendamento?")) delMut.mutate(a.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))
      )}
    </div>
  );
}

function AppointmentDialog({
  services, professionals, editing, onClose,
}: { services: any[]; professionals: any[]; editing: any; onClose: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(upsertAppointment);

  const initialDate = editing ? format(parseISO(editing.starts_at), "yyyy-MM-dd'T'HH:mm") : "";
  const [form, setForm] = useState({
    client_name: editing?.client_name ?? "",
    client_phone: editing?.client_phone ?? "",
    service_id: editing?.service_id ?? "",
    professional_id: editing?.professional_id ?? "",
    starts_at: initialDate,
    notes: editing?.notes ?? "",
    status: editing?.status ?? "agendado",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const service = services.find((s) => s.id === form.service_id);
      const duration = service?.duration_min ?? 30;
      const start = new Date(form.starts_at);
      const ends_at = addMinutes(start, duration).toISOString();
      return save({
        data: {
          ...(editing?.id ? { id: editing.id } : {}),
          client_name: form.client_name,
          client_phone: form.client_phone || null,
          service_id: form.service_id || null,
          professional_id: form.professional_id || null,
          starts_at: start.toISOString(),
          ends_at,
          notes: form.notes || null,
          status: form.status,
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(editing ? "Agendamento atualizado" : "Agendamento criado");
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-display text-primary">{editing ? "Editar" : "Novo"} agendamento</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
        className="space-y-3"
      >
        <div>
          <Label>Cliente</Label>
          <Input required value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
        </div>
        <div>
          <Label>Telefone</Label>
          <Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Serviço</Label>
            <Select value={form.service_id} onValueChange={(v) => setForm({ ...form, service_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration_min}min)</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Profissional</Label>
            <Select value={form.professional_id} onValueChange={(v) => setForm({ ...form, professional_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Data e hora</Label>
          <Input type="datetime-local" required value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
        </div>
        <div>
          <Label>Observações</Label>
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <DialogFooter>
          <Button type="submit" disabled={mut.isPending}>Salvar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
