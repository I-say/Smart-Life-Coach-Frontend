"use client";

import { useState } from "react";
import { ChevronRight, LogOut, Settings, Bot } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AjustesGeneralesModal from "./ajustes-generales-modal";
import AjustesIAModal from "./ajustes-ia-modal";

export default function PerfilOpciones() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isGeneralesOpen, setIsGeneralesOpen] = useState(false);
  const [isIAOpen, setIsIAOpen] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <button 
          onClick={() => setIsIAOpen(true)}
          className="w-full p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <Bot size={18} className="text-blue-500 dark:text-blue-400" />
            Ajustes de la IA
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
        </button>

        <button 
          onClick={() => setIsGeneralesOpen(true)}
          className="w-full p-4 flex justify-between items-center border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            <Settings size={18} className="text-gray-500 dark:text-gray-400" />
            Ajustes Generales
          </div>
          <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
        </button>

        <button 
          onClick={handleLogout}
          disabled={loading}
          className="w-full p-4 flex justify-between items-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-red-600 dark:text-red-400">
            <LogOut size={18} />
            {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
          </div>
          <ChevronRight size={18} className="text-red-300 dark:text-red-500" />
        </button>
      </div>

      <AjustesGeneralesModal 
        isOpen={isGeneralesOpen} 
        onClose={() => setIsGeneralesOpen(false)} 
      />

      <AjustesIAModal
        isOpen={isIAOpen}
        onClose={() => setIsIAOpen(false)}
      />
    </>
  );
}
