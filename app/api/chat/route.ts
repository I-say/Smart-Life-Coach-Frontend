// web/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Extraer sesión de Supabase
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        // La URL del backend en FastAPI, recomendación a mi yo futuro (Usar variables de entorno en producción)
        const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        // Redirigimos la petición de Next.js hacia FastAPI
        const response = await fetch(`${fastApiUrl}/Chat`, {
            method: "POST",
            headers,
            // Enviamos el historial de mensajes, session_id y settings
            body: JSON.stringify({ 
                messages: body.messages,
                session_id: body.session_id,
                ai_settings: body.ai_settings
            }), 
        });

        if (!response.ok) {
            throw new Error(`Error en el backend FastAPI: ${response.status}`);
        }

        // Devolvemos el stream directamente al cliente
        // Importante: el backend en FastAPI debe enviar la respuesta formateada para Vercel AI SDK
        return new Response(response.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "x-vercel-ai-ui-message-stream": "v1", // Header clave para Vercel AI SDK 6
            },
        });

    } catch (error) {
        console.error("Error en el Proxy del Chat:", error);
        return NextResponse.json(
            { error: "Error de comunicación con el servidor de IA." },
            { status: 500 }
        );
    }
}