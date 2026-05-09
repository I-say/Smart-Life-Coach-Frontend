"use client";

import { useState, useRef } from "react";
import { X, Moon, Sun, Download, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { exportarDatos, importarDatos } from "@/app/actions/data";

interface AjustesGeneralesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AjustesGeneralesModal({ isOpen, onClose }: AjustesGeneralesModalProps) {
  const { theme, setTheme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleExport() {
    setIsExporting(true);
    try {
      const data = await exportarDatos();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smart-life-coach-datos-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importarDatos(json);
      alert("¡Datos importados con éxito!");
      onClose();
    } catch (error) {
      alert("Error al importar datos. Asegúrate de que el archivo es válido.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="font-bold text-lg dark:text-white">Ajustes Generales</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* TEMA */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Apariencia</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === "light" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600"
                }`}
              >
                <Sun size={24} />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  theme === "dark" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "border-gray-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-slate-600 dark:text-white"
                }`}
              >
                <Moon size={24} />
                <span className="text-sm font-medium">Oscuro</span>
              </button>
            </div>
          </div>

          {/* DATOS */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tus Datos</h3>
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                  <Download size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm dark:text-white">Exportar Información</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Descarga todos tus planes y tareas</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Upload size={18} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm dark:text-white">Importar Información</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isImporting ? "Importando..." : "Sube un archivo .json"}</p>
                </div>
              </div>
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleImport} 
              className="hidden" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
