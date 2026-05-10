// web/app/tareas/page.tsx
import { WifiOff } from "lucide-react";
import { PlanItem } from "../planes/page";
import FabCrearItem from "@/components/ui/fab-crear-item";
import TareasList from "./components/tareas-list";

interface DatosTareas {
  tareas: PlanItem[] | null;
  planes: PlanItem[]; // para el selector "plan padre" del modal
}

import { createClient } from "@/utils/supabase/server";

async function getDatos(): Promise<DatosTareas> {
  const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${fastApiUrl}/api/planes`, {
      cache: "no-store",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });

    if (!res.ok) return { tareas: [], planes: [] };

    const allItems = (await res.json()) as PlanItem[];

    return {
      tareas: allItems.filter((item) => item.parent_id !== null),
      planes: allItems.filter((item) => item.parent_id === null),
    };
  } catch (error) {
    console.error("Error conectando con el backend:", error);
    return { tareas: null, planes: [] };
  }
}

export default async function TareasPage() {
  const { tareas, planes } = await getDatos();

  return (
    <div className="flex flex-col md:ml-62.5  h-full bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tareas Pendientes</h1>
        <p className="text-gray-500 text-sm">
          El desglose de tus planes de acción
        </p>
      </div>

      <div className="space-y-3">
        {tareas === null ? (
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
          <TareasList tareasIniciales={tareas} planes={planes} />
        )}
      </div>

      {/* FAB: pasa los planes disponibles para el selector "plan padre" */}
      <FabCrearItem tipo="tarea" planes={planes} />
    </div>
  );
}
