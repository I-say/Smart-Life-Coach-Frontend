// web/app/actions/planes.ts
"use server";

import { revalidatePath } from "next/cache";

interface CrearItemPayload {
  title: string;
  description: string;
  due_date?: string | null;
  // null  → es un Plan
  // string → es una Tarea (id del plan padre)
  parent_id?: string | null;
}

/**
 * Crea un Plan o una Tarea en el backend.
 *
 * TODO (backend): Confirmar el endpoint correcto con el equipo de backend.
 * Actualmente se asume POST /api/planes para ambos tipos (plan y tarea),
 * diferenciados únicamente por el campo `parent_id`.
 * Si el endpoint cambia, solo hay que modificar la URL de abajo.
 */
export async function crearItem(payload: CrearItemPayload) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

  const body = {
    user_id: "TU_USER_ID", // TODO: reemplazar con user_id real cuando se implemente auth
    title: payload.title,
    description: payload.description,
    status: "pending",
    due_date: payload.due_date || null,
    parent_id: payload.parent_id || null,
  };

  const res = await fetch(`${fastApiUrl}/api/planes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
