// web/components/ui/fab-crear-item.tsx
"use client";

import { useState } from "react";
import { Plus, X, Loader2, CalendarDays, AlignLeft, Tag } from "lucide-react";
import { crearItem } from "@/app/actions/planes";
import { PlanItem } from "@/app/(app)/planes/page";

interface FabCrearItemProps {
  tipo: "plan" | "tarea";
  /** Solo necesario cuando tipo === "tarea" */
  planes?: PlanItem[];
}

export default function FabCrearItem({
  tipo,
  planes = [],
}: FabCrearItemProps) {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [planPadreId, setPlanPadreId] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const label = tipo === "plan" ? "Plan" : "Tarea";

  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setFechaLimite("");
    setPlanPadreId("");
    setError("");
  };

  const handleCerrar = () => {
    if (!isPending) {
      setAbierto(false);
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (tipo === "tarea" && !planPadreId) {
      setError("Debes seleccionar el plan al que pertenece esta tarea.");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      await crearItem({
        title: titulo.trim(),
        description: descripcion.trim(),
        due_date: fechaLimite || null,
        parent_id: tipo === "tarea" ? planPadreId : null,
      });
      setAbierto(false);
      resetForm();
    } catch {
      setError("No se pudo guardar. Verifica tu conexión e intenta de nuevo.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      {/* ── FAB Button ─────────────────────────────────────────────── */}
      <button
        id={`fab-crear-${tipo}`}
        onClick={() => setAbierto(true)}
        aria-label={`Crear ${label}`}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40
          w-14 h-14 rounded-full shadow-lg
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          text-white flex items-center justify-center
          transition-all duration-200 ease-out
          hover:scale-110 hover:shadow-blue-300/50 hover:shadow-xl
          active:scale-95"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
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
              bg-white rounded-2xl shadow-2xl
              animate-in slide-in-from-bottom-5 fade-in duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2
                  id="modal-titulo"
                  className="text-base font-semibold text-gray-900"
                >
                  Crear {label}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tipo === "plan"
                    ? "Define tu nuevo plan de acción"
                    : "Agrega una tarea a uno de tus planes"}
                </p>
              </div>
              <button
                onClick={handleCerrar}
                disabled={isPending}
                aria-label="Cerrar modal"
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Título */}
              <div>
                <label
                  htmlFor={`input-titulo-${tipo}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                >
                  <Tag size={12} />
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  id={`input-titulo-${tipo}`}
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder={`Nombre del ${label.toLowerCase()}...`}
                  disabled={isPending}
                  autoFocus
                  className="
                    w-full px-3 py-2.5 rounded-lg border border-gray-200
                    text-sm text-gray-800 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-400
                    transition-all
                  "
                />
              </div>

              {/* Selector de Plan padre (solo para tareas) */}
              {tipo === "tarea" && (
                <div>
                  <label
                    htmlFor="select-plan-padre"
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                  >
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
                    id="select-plan-padre"
                    value={planPadreId}
                    onChange={(e) => setPlanPadreId(e.target.value)}
                    disabled={isPending || planes.length === 0}
                    className="
                      w-full px-3 py-2.5 rounded-lg border border-gray-200
                      text-sm text-gray-800
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:bg-gray-50 disabled:text-gray-400
                      transition-all bg-white
                    "
                  >
                    <option value="">
                      {planes.length === 0
                        ? "No hay planes disponibles — crea uno primero"
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
                <label
                  htmlFor={`input-desc-${tipo}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                >
                  <AlignLeft size={12} />
                  Descripción{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id={`input-desc-${tipo}`}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Agrega más detalles..."
                  rows={3}
                  disabled={isPending}
                  className="
                    w-full px-3 py-2.5 rounded-lg border border-gray-200
                    text-sm text-gray-800 placeholder:text-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-400
                    transition-all resize-none
                  "
                />
              </div>

              {/* Fecha límite */}
              <div>
                <label
                  htmlFor={`input-fecha-${tipo}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5"
                >
                  <CalendarDays size={12} />
                  Fecha límite{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  id={`input-fecha-${tipo}`}
                  type="date"
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  disabled={isPending}
                  className="
                    w-full px-3 py-2.5 rounded-lg border border-gray-200
                    text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-50 disabled:text-gray-400
                    transition-all
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Botones */}
              <div className="flex gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={handleCerrar}
                  disabled={isPending}
                  className="
                    flex-1 px-4 py-2.5 rounded-lg text-sm font-medium
                    text-gray-600 bg-gray-100 hover:bg-gray-200
                    transition-colors disabled:opacity-50
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || (tipo === "tarea" && planes.length === 0)}
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
                    `Crear ${label}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
