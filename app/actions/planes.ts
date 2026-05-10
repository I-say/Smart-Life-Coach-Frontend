// web/app/actions/planes.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

interface CrearItemPayload {
  title: string;
  description: string;
  due_date?: string | null;
  // null  → es un Plan
  // string → es una Tarea (id del plan padre)
  parent_id?: string | null;
}

export async function crearItem(payload: CrearItemPayload) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

  // Extraer sesión de Supabase
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("No estás autenticado.");
  }

  const body = {
    title: payload.title,
    description: payload.description,
    status: "pending",
    due_date: payload.due_date || null,
    parent_id: payload.parent_id || null,
  };

  const res = await fetch(`${fastApiUrl}/api/planes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
  }

  // Limpiamos el caché para que ambas páginas muestren el nuevo item
  revalidatePath("/planes");
  revalidatePath("/tareas");

  return res.json();
}

export async function editarItem(id: string, payload: Partial<CrearItemPayload>) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error("No estás autenticado.");

  const res = await fetch(`${fastApiUrl}/api/planes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Error editando item");

  revalidatePath("/planes");
  revalidatePath("/tareas");

  return res.json();
}

export async function eliminarItem(id: string) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error("No estás autenticado.");

  const res = await fetch(`${fastApiUrl}/api/planes/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Error eliminando item");

  revalidatePath("/planes");
  revalidatePath("/tareas");

  return res.json();
}
