"use client";

import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { PlanItem } from "../../planes/page";
import BotonEstadoTarea from "@/components/ui/button-estado-tarea";

interface TareasListProps {
  tareasIniciales: PlanItem[];
}

export default function TareasList({ tareasIniciales }: TareasListProps) {
  const [hideCompleted, setHideCompleted] = useState(false);

  const tareas = hideCompleted 
    ? tareasIniciales.filter(t => t.status !== "completed")
    : tareasIniciales;

  if (tareasIniciales.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No hay tareas asignadas en este momento.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm"
        >
          {hideCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
          {hideCompleted ? "Mostrar completadas" : "Ocultar completadas"}
        </button>
      </div>

      {tareas.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay tareas pendientes. ¡Todo al día!</p>
      ) : (
        tareas.map((tarea) => (
          <div
            key={tarea.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <BotonEstadoTarea id={tarea.id} status={tarea.status} />
            <div className="flex-1">
              <h3
                className={`font-bold ${tarea.status === "completed" ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-100"}`}
              >
                {tarea.title}
              </h3>
              {tarea.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {tarea.description}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
