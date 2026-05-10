"use client";

import { useState } from "react";
import { EyeOff, Eye, Edit3, Filter } from "lucide-react";
import { PlanItem } from "../../planes/page";
import BotonEstadoTarea from "@/components/ui/button-estado-tarea";
import ModalEditarItem from "@/components/ui/modal-editar-item";

interface TareasListProps {
  tareasIniciales: PlanItem[];
  planes: PlanItem[];
}

export default function TareasList({ tareasIniciales, planes }: TareasListProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [planFiltro, setPlanFiltro] = useState<string>("all");
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);

  let tareas = hideCompleted 
    ? tareasIniciales.filter(t => t.status !== "completed")
    : tareasIniciales;

  if (planFiltro !== "all") {
    tareas = tareas.filter(t => t.parent_id === planFiltro);
  }

  if (tareasIniciales.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No hay tareas asignadas en este momento.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-400" />
          <select
            value={planFiltro}
            onChange={(e) => setPlanFiltro(e.target.value)}
            className="flex-1 sm:flex-none text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todos los planes</option>
            {planes.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm w-full sm:w-auto"
        >
          {hideCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
          {hideCompleted ? "Mostrar completadas" : "Ocultar completadas"}
        </button>
      </div>

      {tareas.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay tareas para este filtro. ¡Todo al día!</p>
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
            <button
              onClick={() => setEditingItem(tarea)}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex-shrink-0"
              aria-label="Editar tarea"
            >
              <Edit3 size={18} />
            </button>
          </div>
        ))
      )}

      {editingItem && (
        <ModalEditarItem
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          planes={planes}
        />
      )}
    </div>
  );
}
