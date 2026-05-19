import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, updateProfile } from "@/lib/salon.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Ajustes — Cia da Beleza" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(getProfile);
  const saveFn = useServerFn(updateProfile);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchFn() });

  const [form, setForm] = useState({ salon_name: "", phone: "" });
  useEffect(() => {
    if (profile) setForm({ salon_name: profile.salon_name ?? "", phone: profile.phone ?? "" });
  }, [profile]);

  const mut = useMutation({
    mutationFn: () => saveFn({ data: { salon_name: form.salon_name, phone: form.phone || null } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Perfil atualizado"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display text-primary">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Informações do salão</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg mb-4">Salão</h2>
        <form onSubmit={(e) => { e.preventDefault(); mut.mutate(); }} className="space-y-3">
          <div><Label>Nome do salão</Label><Input required value={form.salon_name} onChange={(e) => setForm({ ...form, salon_name: e.target.value })} /></div>
          <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <Button type="submit" disabled={mut.isPending}>Salvar</Button>
        </form>
      </Card>
    </div>
  );
}
