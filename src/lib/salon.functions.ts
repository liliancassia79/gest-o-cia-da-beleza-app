import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SALON_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

// ===== Services =====
export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("services").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const serviceInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  duration_min: z.number().int().min(5).max(600),
  price: z.number().min(0).max(99999),
  active: z.boolean().default(true),
});

export const upsertService = createServerFn({ method: "POST" })
  .inputValidator((d) => serviceInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("services").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Professionals =====
export const listProfessionals = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("professionals").select("*").order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const professionalInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  specialty: z.string().trim().max(120).optional().nullable(),
  active: z.boolean().default(true),
});

export const upsertProfessional = createServerFn({ method: "POST" })
  .inputValidator((d) => professionalInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("professionals").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProfessional = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("professionals").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Appointments =====
const appointmentStatus = z.enum(["agendado", "confirmado", "concluido", "cancelado"]);
const appointmentOrigin = z.enum(["manual", "site"]);

const appointmentInput = z.object({
  id: z.string().uuid().optional(),
  client_name: z.string().trim().min(1).max(120),
  client_phone: z.string().trim().max(40).optional().nullable(),
  service_id: z.string().uuid().optional().nullable(),
  professional_id: z.string().uuid().optional().nullable(),
  starts_at: z.string(),
  ends_at: z.string(),
  status: appointmentStatus.default("agendado"),
  origin: appointmentOrigin.default("manual"),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const listAppointments = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("*, services(name, price), professionals(name)")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const upsertAppointment = createServerFn({ method: "POST" })
  .inputValidator((d) => appointmentInput.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("appointments").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: appointmentStatus }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("appointments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("appointments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Profile =====
export const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", SALON_PROFILE_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      salon_name: z.string().trim().min(1).max(120),
      phone: z.string().trim().max(40).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: SALON_PROFILE_ID, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
