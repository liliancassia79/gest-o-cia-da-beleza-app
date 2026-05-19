import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProfessionals, upsertProfessional, deleteProfessional } from "@/lib/salon.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profissionais")({
  head: () => ({ meta: [{ title: "Profissionais — Cia da Beleza" }] }),
  component: ProfessionalsPage,
});

function ProfessionalsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listProfessionals);
  const { data: items = [] } = useQuery({ queryKey: ["professionals"], queryFn: () => fetchFn() });

  const remove = useServerFn(deleteProfessional);
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["professionals"] }); toast.success("Removido"); },
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-primary">Profissionais</h1>
          <p className="text-sm text-muted-foreground">Equipe que atende no salão</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="h-4 w-4 mr-1" />Novo</Button>
          </DialogTrigger>
          <ProForm editing={editing} onClose={() => { setOpen(false); setEditing(null); }} />
        </Dialog>
      </div>

      <Card className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Nenhum profissional cadastrado.</div>
        ) : items.map((p: any) => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium flex items-center gap-2">
                {p.name}
                {!p.active && <span className="text-xs text-muted-foreground">(inativo)</span>}
              </div>
              {p.specialty && <div className="text-sm text-muted-foreground">{p.specialty}</div>}
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => { if (confirm("Remover?")) delMut.mutate(p.id); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ProForm({ editing, onClose }: { editing: any; onClose: () => void }) {
  const qc = useQueryClient();
  const save = useServerFn(upsertProfessional);
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    specialty: editing?.specialty ?? "",
    active: editing?.active ?? true,
  });
  const mut = useMutation({
    mutationFn: () => save({
      data: {
        ...(editing?.id ? { id: editing.id } : {}),
        name: form.name,
        specialty: form.specialty || null,
        active: form.active,
      },
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["professionals"] }); toast.success("Salvo"); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <DialogContent>
      <DialogHeader><DialogTitle className="font-display text-primary">{editing ? "Editar" : "Novo"} profissional</DialogTitle></DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-3">
        <div><Label>Nome</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Especialidade</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Ex: Cabeleireira" /></div>
        <div className="flex items-center justify-between">
          <Label htmlFor="active">Ativo</Label>
          <Switch id="active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <DialogFooter><Button type="submit" disabled={mut.isPending}>Salvar</Button></DialogFooter>
      </form>
    </DialogContent>
  );
}
