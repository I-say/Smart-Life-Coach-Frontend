"use client";

import { useState } from "react";
import { EyeOff, Eye, Edit3 } from "lucide-react";
import { PlanItemConProgreso } from "../page";
import ModalEditarItem from "@/components/ui/modal-editar-item";

interface PlanesListProps {
  planesInciales: PlanItemConProgreso[];
}

export default function PlanesList({ planesInciales }: PlanesListProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItemConProgreso | null>(null);

  const planes = hideCompleted 
    ? planesInciales.filter(p => p.status !== "completed" && p.progreso < 100)
    : planesInciales;

  if (planesInciales.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">Aún no tienes planes. ¡Pídele uno al Coach!</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setHideCompleted(!hideCompleted)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-800 shadow-sm"
        >
          {hideCompleted ? <Eye size={16} /> : <EyeOff size={16} />}
          {hideCompleted ? "Mostrar completados" : "Ocultar completados"}
        </button>
      </div>

      {planes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay planes pendientes. ¡Buen trabajo!</p>
      ) : (
        planes.map((plan) => (
          <div
            key={plan.id}
            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{plan.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {plan.progreso}% completado
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingItem(plan)}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                  aria-label="Editar plan"
                >
                  <Edit3 size={16} />
                </button>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    plan.status === "completed" || plan.progreso === 100
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : (plan.progreso === 0 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400")
                  }`}
                >
                  {plan.status === "completed" || plan.progreso === 100
                    ? "Finalizado"
                    : (plan.progreso === 0 ? "Por iniciar" : "En curso")}
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${plan.progreso}%` }}
              ></div>
            </div>
          </div>
        ))
      )}

      {editingItem && (
        <ModalEditarItem
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      )}
    </div>
  );
}
