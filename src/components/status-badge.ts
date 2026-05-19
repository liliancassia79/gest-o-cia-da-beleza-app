export function statusBadge(status: string) {
  switch (status) {
    case "confirmado":
      return "border-primary/60 text-primary bg-primary/10";
    case "concluido":
      return "border-emerald-600/50 text-emerald-400 bg-emerald-600/10";
    case "cancelado":
      return "border-destructive/50 text-destructive bg-destructive/10";
    default:
      return "border-accent/60 text-accent bg-accent/10";
  }
}
