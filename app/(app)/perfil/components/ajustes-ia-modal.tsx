"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface AjustesIAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AjustesIAModal({ isOpen, onClose }: AjustesIAModalProps) {
  const [nombre, setNombre] = useState("Smart Life Coach");
  const [tono, setTono] = useState("Profesional y motivador");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const settings = localStorage.getItem("ai_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.nombre) setNombre(parsed.nombre);
        if (parsed.tono) setTono(parsed.tono);
      }
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem("ai_settings", JSON.stringify({ nombre, tono }));
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ajustes de la IA</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Coach</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-gray-200"
              placeholder="Ej: Max, Entrenador AI..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tono de Personalidad</label>
            <select 
              value={tono}
              onChange={(e) => setTono(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-gray-200"
            >
              <option value="Profesional y motivador">Profesional y Motivador</option>
              <option value="Directo y estricto (militar)">Directo y Estricto (Estilo Militar)</option>
              <option value="Amigable y empático">Amigable y Empático</option>
              <option value="Filosófico y reflexivo">Filosófico y Reflexivo</option>
              <option value="Sarcástico pero útil">Sarcástico pero útil</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={18} />
            {saved ? "Guardado!" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
