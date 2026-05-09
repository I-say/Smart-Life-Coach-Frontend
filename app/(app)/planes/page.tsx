// web/app/planes/page.tsx
import { WifiOff } from "lucide-react";
import FabCrearItem from "@/components/ui/fab-crear-item";
import PlanesList from "./components/planes-list";

export interface PlanItem {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string;
  status: "pending" | "completed";
  due_date: string;
  created_at: string;
  updated_at: string;
}

// calculo de progreso
export interface PlanItemConProgreso extends PlanItem {
  progreso: number;
}

import { createClient } from "@/utils/supabase/server";

// Función para obtener los planes desde FastAPI
async function getPlanesConProgreso(): Promise<PlanItemConProgreso[] | null> {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${fastApiUrl}/api/planes`, {
      cache: "no-store",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });

    if (!res.ok) return [];
    const allItems = (await res.json()) as PlanItem[];
    const planes = allItems.filter((item) => item.parent_id === null);
    const tareas = allItems.filter((item) => item.parent_id !== null);
    // return allItems.filter(item => item.parent_id === null);
    // return res.json() as Promise<PlanItem[]>;

    const planesCalculados = planes.map((plan) => {
      const tareasDelPlan = tareas.filter(
        (tarea) => tarea.parent_id === plan.id,
      );
      const totalTareas = tareasDelPlan.length;

      let porcentaje = 0;

      if (totalTareas > 0) {
        const tareasCompletadas = tareasDelPlan.filter(
          (t) => t.status === "completed",
        ).length;
        porcentaje = Math.round((tareasCompletadas / totalTareas) * 100);
      } else {
        porcentaje = plan.status === "completed" ? 100 : 0;
      }

      return { ...plan, progreso: porcentaje };
    });

    return planesCalculados;
  } catch (error) {
    console.error("Error conectando con el backend:", error);
    return null;
  }
}

export default async function PlanesPage() {
  // Obtenemos los datos reales antes de renderizar la página
  const planes = await getPlanesConProgreso();
  return (
    <div className="flex flex-col md:ml-62.5  h-full bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tus Planes</h1>
        <p className="text-gray-500 text-sm">Tus objetivos y metas de acción</p>
      </div>

      <div className="space-y-4">
        {/* Renderizamos dinámicamente desde la base de datos */}
        {planes === null ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3">
            <WifiOff className="text-red-400" size={40} />
            <h3 className="font-bold text-red-800 dark:text-red-400">
              Sin conexión con el Servidor
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
              No pudimos conectar con el servidor. Verifica tu conexión a
              internet o intenta de nuevo más tarde.
            </p>
          </div>
        ) : (
          <PlanesList planesInciales={planes} />
        )}
      </div>

      <FabCrearItem tipo="plan" />
    </div>
  );
}
