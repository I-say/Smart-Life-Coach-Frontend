"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { PlanItem } from "../(app)/planes/page";

export async function exportarDatos(): Promise<PlanItem[]> {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error("No autenticado");

  const res = await fetch(`${fastApiUrl}/api/planes`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!res.ok) throw new Error("Error al exportar datos");
  return res.json();
}

export async function importarDatos(items: PlanItem[]) {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) throw new Error("No autenticado");

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };

  const planes = items.filter(i => i.parent_id === null);
  const tareas = items.filter(i => i.parent_id !== null);

  // Mapeo de IDs viejos a IDs nuevos
  const idMap = new Map<string, string>();

  // 1. Crear Planes
  for (const plan of planes) {
    const res = await fetch(`${fastApiUrl}/api/planes`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: plan.title,
        description: plan.description,
        status: plan.status,
        due_date: plan.due_date,
        parent_id: null
      })
    });
    
    if (res.ok) {
      const nuevoPlan = await res.json();
      idMap.set(plan.id, nuevoPlan.id);
    }
  }

  // 2. Crear Tareas
  for (const tarea of tareas) {
    const newParentId = idMap.get(tarea.parent_id!) || null;
    
    // Si la tarea pertenecía a un plan que se importó, usar el nuevo ID
    // Si no, la importamos como huérfana o plan independiente (no debería pasar si el JSON es íntegro)
    await fetch(`${fastApiUrl}/api/planes`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: tarea.title,
        description: tarea.description,
        status: tarea.status,
        due_date: tarea.due_date,
        parent_id: newParentId
      })
    });
  }

  revalidatePath("/planes");
  revalidatePath("/tareas");
}
