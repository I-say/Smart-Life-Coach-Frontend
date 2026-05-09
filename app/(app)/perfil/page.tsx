// web/app/Perfil/page.tsx
import { User } from "lucide-react";
import PerfilOpciones from "./components/perfil-opciones";
import { createClient } from "@/utils/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name || "Usuario";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="flex flex-col md:ml-62.5  h-full bg-gray-50 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center mb-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-blue-50">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-blue-600" />
          )}
        </div>
        <h2 className="font-bold text-xl text-gray-800">{fullName}</h2>
        <p className="text-blue-600 font-medium text-sm mt-1 bg-blue-50 px-3 py-1 rounded-full">
          Nivel: Aprendiz
        </p>
      </div>

      <PerfilOpciones />
    </div>
  );
}
