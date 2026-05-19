import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listServices, upsertService, deleteService } from "@/lib/salon.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/servicos")({
  head: () => ({ meta: [{ title: "Serviços — Cia da Beleza" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listServices);
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => fetchFn() });

  const remove = useServerFn(deleteService);
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Serviço removido"); },
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Serviços</h1>
          <p className="text-sm text-muted-foreground">Cadastre os serviços oferecidos pelo salão</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />Novo serviço</Button>
          </DialogTrigger>
          <ServiceForm editing={editing} onClose={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </div>

      <Card className="divide-y divide-border">
        {services.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum serviço cadastrado.</div>
        ) : services.map((s: any) => (
          <div key={s.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium flex items-center gap-2">
                {s.name}
                {!s.active && <span className="text-xs text-muted-foreground">(inativo)</span>}
              </div>
              <div className="text-sm text-muted-foreground">{s.duration_min} min · R$ {Number(s.price).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover serviço?")) delMut.mutate(s.id); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ServiceForm({ editing, onClose }: { editing: any; onClose: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(upsertService);
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    duration_min: editing?.duration_min ?? 30,
    price: editing?.price ?? 0,
    active: editing?.active ?? true,
  });
  const mut = useMutation({
    mutationFn: () => save({
      data: {
        ...(editing?.id ? { id: editing.id } : {}),
        name: form.name,
        duration_min: Number(form.duration_min),
        price: Number(form.price),
        active: form.active,
      },
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Salvo"); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader><DialogTitle className="font-display text-primary">{editing ? "Editar" : "Novo"} serviço</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-3">
        <div>
          <Label>Nome</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Duração (min)</Label>
            <Input type="number" min={5} required value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })} />
          </div>
          <div>
            <Label>Preço (R$)</Label>
            <Input type="number" min={0} step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="ac">Ativo</Label>
          <Switch id="ac" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <DialogFooter><Button type="submit" disabled={mut.isPending}>Salvar</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
