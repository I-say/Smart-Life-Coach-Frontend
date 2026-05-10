"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CalendarDays, AlignLeft, Tag, Trash2 } from "lucide-react";
import { editarItem, eliminarItem } from "@/app/actions/planes";
import { PlanItem } from "@/app/(app)/planes/page";

interface ModalEditarItemProps {
  isOpen: boolean;
  onClose: () => void;
  item: PlanItem;
  planes?: PlanItem[]; // Solo necesario si item es una Tarea y se quiere poder cambiar de plan padre
}

export default function ModalEditarItem({
  isOpen,
  onClose,
  item,
  planes = [],
}: ModalEditarItemProps) {
  const [titulo, setTitulo] = useState(item.title);
  const [descripcion, setDescripcion] = useState(item.description || "");
  const [fechaLimite, setFechaLimite] = useState(
    item.due_date ? item.due_date.substring(0, 10) : ""
  );
  const [planPadreId, setPlanPadreId] = useState(item.parent_id || "");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when item changes
  useEffect(() => {
    if (isOpen) {
      setTitulo(item.title);
      setDescripcion(item.description || "");
      setFechaLimite(item.due_date ? item.due_date.substring(0, 10) : "");
      setPlanPadreId(item.parent_id || "");
      setError("");
      setIsPending(false);
      setIsDeleting(false);
    }
  }, [isOpen, item]);

  const esTarea = item.parent_id !== null;
  const label = esTarea ? "Tarea" : "Plan";

  const handleCerrar = () => {
    if (!isPending && !isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar est${esTarea ? "a" : "e"} ${label.toLowerCase()}? ${!esTarea ? "Se eliminarán todas sus tareas asociadas." : ""}`)) {
      return;
    }
    
    setIsDeleting(true);
    setError("");

    try {
      await eliminarItem(item.id);
      onClose();
    } catch (e) {
      setError("No se pudo eliminar. Verifica tu conexión.");
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (esTarea && !planPadreId) {
      setError("Debes seleccionar el plan al que pertenece esta tarea.");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      await editarItem(item.id, {
        title: titulo.trim(),
        description: descripcion.trim(),
        due_date: fechaLimite || null,
        parent_id: esTarea ? planPadreId : null,
      });
      onClose();
    } catch (e) {
      setError("No se pudo guardar. Verifica tu conexión e intenta de nuevo.");
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleCerrar}
      />

      {/* Card */}
      <div
        className="
          relative z-10 w-full max-w-md mx-4 mb-4 md:mb-0
          bg-white dark:bg-slate-900 rounded-2xl shadow-2xl
          animate-in slide-in-from-bottom-5 fade-in duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Editar {label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending || isDeleting}
              aria-label={`Eliminar ${label}`}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-1.5 transition-colors disabled:opacity-40"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
            <button
              onClick={handleCerrar}
              disabled={isPending || isDeleting}
              aria-label="Cerrar modal"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-1.5 transition-colors disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Título */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <Tag size={12} />
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={`Nombre del ${label.toLowerCase()}...`}
              disabled={isPending || isDeleting}
              autoFocus
              className="
                w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700
                text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400
                transition-all bg-transparent
              "
            />
          </div>

          {/* Selector de Plan padre (solo para tareas) */}
          {esTarea && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                </svg>
                Plan padre <span className="text-red-500">*</span>
              </label>
              <select
                value={planPadreId}
                onChange={(e) => setPlanPadreId(e.target.value)}
                disabled={isPending || isDeleting || planes.length === 0}
                className="
                  w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700
                  text-sm text-gray-800 dark:text-gray-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400
                  transition-all bg-white dark:bg-slate-900
                "
              >
                <option value="">
                  {planes.length === 0
                    ? "No hay planes disponibles"
                    : "Selecciona un plan..."}
                </option>
                {planes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <AlignLeft size={12} />
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Agrega más detalles..."
              rows={3}
              disabled={isPending || isDeleting}
              className="
                w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700
                text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400
                transition-all resize-none bg-transparent
              "
            />
          </div>

          {/* Fecha límite */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              <CalendarDays size={12} />
              Fecha límite <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
              disabled={isPending || isDeleting}
              className="
                w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700
                text-sm text-gray-800 dark:text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400
                transition-all bg-transparent
              "
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-1 pb-1">
            <button
              type="button"
              onClick={handleCerrar}
              disabled={isPending || isDeleting}
              className="
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700
                transition-colors disabled:opacity-50
              "
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || isDeleting || (esTarea && planes.length === 0)}
              className="
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                text-white bg-blue-600 hover:bg-blue-700
                flex items-center justify-center gap-2
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                `Guardar Cambios`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
