# Protocolo de Comunicación del Chat — AI SDK v6

> **Versión del SDK**: `ai@6.0.x` + `@ai-sdk/react@3.0.x`
>
> **Propósito**: Guía técnica para que cualquier backend (FastAPI, Django, Express, Java, etc.) pueda comunicarse correctamente con el hook `useChat` del frontend.
>
> **Última actualización**: Mayo 2026

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Lo que el Frontend Envía (Request)](#2-lo-que-el-frontend-envía-request)
3. [Lo que el Backend Debe Responder (Response Stream)](#3-lo-que-el-backend-debe-responder-response-stream)
4. [Formato del Stream: UI Message Stream Protocol v1](#4-formato-del-stream-ui-message-stream-protocol-v1)
5. [Ejemplo Completo del Stream](#5-ejemplo-completo-del-stream)
6. [Implementación en FastAPI (Python)](#6-implementación-en-fastapi-python)
7. [Implementación en Node.js / Express](#7-implementación-en-nodejs--express)
8. [Errores Comunes y Soluciones](#8-errores-comunes-y-soluciones)
9. [Referencia Rápida](#9-referencia-rápida)

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                            │
│                                                             │
│  useChat() hook                                             │
│    │                                                        │
│    ├─ sendMessage({ text: "Hola" })                         │
│    │     └─ POST /api/chat  { messages: [...] }             │
│    │                                                        │
│    └─ Recibe stream SSE ← lee token por token               │
│         └─ Actualiza messages[] → React re-renderiza        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS (Proxy)                           │
│                                                              │
│  app/api/chat/route.ts                                       │
│    1. Recibe POST con { messages: [...] }                    │
│    2. Reenvía a FastAPI                                      │
│    3. Devuelve el stream SSE al navegador                    │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP POST
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                          │
│                                                              │
│  /Chat                                                       │
│    1. Recibe los mensajes                                    │
│    2. Llama a Gemini / modelo de IA                          │
│    3. Responde con stream SSE en formato                     │
│       UI Message Stream Protocol v1                          │
└──────────────────────────────────────────────────────────────┘
```

> **Nota**: El proxy de Next.js (`app/api/chat/route.ts`) simplemente reenvía el body y retorna el stream. La lógica de IA está 100% en el backend.

---

## 2. Lo que el Frontend Envía (Request)

Cuando el usuario escribe un mensaje y presiona enviar, `useChat` hace automáticamente:

### HTTP Request

```
POST /api/chat
Content-Type: application/json
```

### Body (JSON)

```json
{
  "id": "4EWZui1Mp5W8Rzvb",
  "messages": [
    {
      "id": "welcome",
      "role": "assistant",
      "parts": [
        {
          "type": "text",
          "text": "¡Hola! Soy tu coach de vida inteligente..."
        }
      ]
    },
    {
      "id": "qBnYHnh66rGpbmxL",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Quiero hacer ejercicio 3 veces por semana"
        }
      ]
    }
  ],
  "trigger": "submit-message"
}
```

### Campos importantes del body

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID único de la conversación, generado por useChat |
| `messages` | `array` | **Historial completo** de la conversación (todos los mensajes anteriores + el nuevo) |
| `messages[].id` | `string` | ID único del mensaje |
| `messages[].role` | `string` | `"user"` o `"assistant"` |
| `messages[].parts` | `array` | Array de partes del mensaje |
| `messages[].parts[].type` | `string` | Siempre `"text"` para mensajes de texto |
| `messages[].parts[].text` | `string` | El contenido del mensaje |
| `trigger` | `string` | `"submit-message"` cuando el usuario envía un mensaje nuevo |

> ⚠️ **Importante**: El frontend envía **TODOS** los mensajes anteriores en cada request, no solo el último. Esto permite que el backend tenga el contexto completo de la conversación para enviárselo al modelo de IA.

---

## 3. Lo que el Backend Debe Responder (Response Stream)

El backend debe responder con un **stream SSE** (Server-Sent Events) que sigue el protocolo específico del AI SDK v6.

### Response Headers (OBLIGATORIOS)

```http
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
x-vercel-ai-ui-message-stream: v1
```

> ⚠️ **El header `x-vercel-ai-ui-message-stream: v1` es OBLIGATORIO**. Sin este header, el SDK no reconocerá el stream como válido. Este es el header para AI SDK v6. Versiones anteriores usaban `X-Vercel-AI-Data-Stream: v1` con un formato diferente.

### Formato de cada evento SSE

Cada evento es una línea que empieza con `data: ` seguida de un JSON, terminando con dos saltos de línea:

```
data: {"type":"...", ...campos}\n\n
```

---

## 4. Formato del Stream: UI Message Stream Protocol v1

El stream debe enviar los eventos en este orden exacto:

```
start → start-step → text-start → text-delta (×N) → text-end → finish-step → finish
```

### 4.1 `start` — Inicio del response

Indica que el backend empieza a generar una respuesta. **No lleva campos extra.**

```json
{"type": "start"}
```

### 4.2 `start-step` — Inicio de un step

Indica el inicio de un paso de procesamiento. **No lleva campos extra.**

```json
{"type": "start-step"}
```

### 4.3 `text-start` — Inicio de un bloque de texto

Indica que va a comenzar a enviar texto. **Requiere un `id` único** que identifica este bloque de texto (este `id` se usa después en los deltas y en `text-end`).

```json
{"type": "text-start", "id": "part-abc123"}
```

### 4.4 `text-delta` — Fragmento de texto (se repite N veces)

Envía un fragmento (delta) del texto. Se envía **una vez por cada token/palabra** que genera el modelo. **Requiere `id` (mismo que text-start) y `delta`** (el fragmento de texto).

```json
{"type": "text-delta", "id": "part-abc123", "delta": "¡Hola! "}
```

```json
{"type": "text-delta", "id": "part-abc123", "delta": "Soy "}
```

```json
{"type": "text-delta", "id": "part-abc123", "delta": "tu coach."}
```

> 💡 **Tip**: El `delta` puede ser una palabra, varias palabras, o incluso un carácter. Lo que importa es que al concatenar todos los deltas, se forme el texto completo de la respuesta.

### 4.5 `text-end` — Fin del bloque de texto

Indica que terminó el bloque de texto. **Requiere el mismo `id` que `text-start`.**

```json
{"type": "text-end", "id": "part-abc123"}
```

### 4.6 `finish-step` — Fin del step

Indica que terminó el paso de procesamiento. **No lleva campos extra** (ni `finishReason`, ni `usage`).

```json
{"type": "finish-step"}
```

### 4.7 `finish` — Fin del response completo

Indica que el backend terminó de generar la respuesta. **Acepta `finishReason` pero NO `usage`.**

```json
{"type": "finish", "finishReason": "stop"}
```

Valores posibles de `finishReason`:
- `"stop"` — El modelo terminó naturalmente
- `"length"` — Se alcanzó el límite de tokens
- `"error"` — Ocurrió un error

### Resumen de campos por tipo

| Tipo | `id` | `delta` | `finishReason` | Otros |
|------|------|---------|----------------|-------|
| `start` | ❌ | ❌ | ❌ | — |
| `start-step` | ❌ | ❌ | ❌ | — |
| `text-start` | ✅ obligatorio | ❌ | ❌ | — |
| `text-delta` | ✅ obligatorio | ✅ obligatorio | ❌ | — |
| `text-end` | ✅ obligatorio | ❌ | ❌ | — |
| `finish-step` | ❌ | ❌ | ❌ | — |
| `finish` | ❌ | ❌ | ✅ opcional | — |

---

## 5. Ejemplo Completo del Stream

Así se ve un stream real completo (cada línea es un evento SSE):

```
data: {"type":"start"}

data: {"type":"start-step"}

data: {"type":"text-start","id":"part-001"}

data: {"type":"text-delta","id":"part-001","delta":"¡Hola! "}

data: {"type":"text-delta","id":"part-001","delta":"Soy "}

data: {"type":"text-delta","id":"part-001","delta":"tu "}

data: {"type":"text-delta","id":"part-001","delta":"coach "}

data: {"type":"text-delta","id":"part-001","delta":"de vida. "}

data: {"type":"text-delta","id":"part-001","delta":"¿En qué "}

data: {"type":"text-delta","id":"part-001","delta":"puedo ayudarte?"}

data: {"type":"text-end","id":"part-001"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"stop"}

```

> ⚠️ Nota: Cada evento termina con **dos saltos de línea** (`\n\n`). Esto es parte del estándar SSE.

El texto final que ve el usuario sería: `¡Hola! Soy tu coach de vida. ¿En qué puedo ayudarte?`

---

## 6. Implementación en FastAPI (Python)

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import asyncio
import uuid

app = FastAPI()

@app.post("/Chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    
    # Extraer el último mensaje del usuario
    last_user_msg = None
    for msg in reversed(messages):
        if msg["role"] == "user":
            last_user_msg = msg
            break
    
    user_text = ""
    if last_user_msg:
        parts = last_user_msg.get("parts", [])
        if parts and parts[0].get("type") == "text":
            user_text = parts[0]["text"]
    
    async def generate_stream():
        part_id = f"part-{uuid.uuid4().hex[:8]}"
        
        # 1. start
        yield f"data: {json.dumps({'type': 'start'})}\n\n"
        
        # 2. start-step
        yield f"data: {json.dumps({'type': 'start-step'})}\n\n"
        
        # 3. text-start
        yield f"data: {json.dumps({'type': 'text-start', 'id': part_id})}\n\n"
        
        # 4. text-delta — Aquí va la lógica de la IA
        # ──────────────────────────────────────────────
        # Opción A: Respuesta de un modelo con streaming (Gemini, OpenAI, etc.)
        #   for chunk in model.generate_stream(messages):
        #       yield f"data: {json.dumps({'type': 'text-delta', 'id': part_id, 'delta': chunk.text})}\n\n"
        #       await asyncio.sleep(0)  # Permite que FastAPI envíe el chunk
        #
        # Opción B: Respuesta simple (para pruebas)
        response_text = f"Recibí tu mensaje: {user_text}"
        words = response_text.split(" ")
        for word in words:
            delta = word + " "
            yield f"data: {json.dumps({'type': 'text-delta', 'id': part_id, 'delta': delta})}\n\n"
            await asyncio.sleep(0.03)  # Simular delay de generación
        
        # 5. text-end
        yield f"data: {json.dumps({'type': 'text-end', 'id': part_id})}\n\n"
        
        # 6. finish-step
        yield f"data: {json.dumps({'type': 'finish-step'})}\n\n"
        
        # 7. finish
        yield f"data: {json.dumps({'type': 'finish', 'finishReason': 'stop'})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "x-vercel-ai-ui-message-stream": "v1",
        },
    )
```

### Con Google Gemini (ejemplo real)

```python
import google.generativeai as genai

genai.configure(api_key="TU_API_KEY")
model = genai.GenerativeModel("gemini-2.5-flash")

@app.post("/Chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    
    # Convertir mensajes del formato AI SDK al formato Gemini
    gemini_history = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        text = msg["parts"][0]["text"] if msg.get("parts") else ""
        gemini_history.append({"role": role, "parts": [text]})
    
    async def generate_stream():
        part_id = f"part-{uuid.uuid4().hex[:8]}"
        
        yield f"data: {json.dumps({'type': 'start'})}\n\n"
        yield f"data: {json.dumps({'type': 'start-step'})}\n\n"
        yield f"data: {json.dumps({'type': 'text-start', 'id': part_id})}\n\n"
        
        # Stream real de Gemini
        response = model.generate_content(
            gemini_history,
            stream=True
        )
        
        for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'type': 'text-delta', 'id': part_id, 'delta': chunk.text})}\n\n"
                await asyncio.sleep(0)
        
        yield f"data: {json.dumps({'type': 'text-end', 'id': part_id})}\n\n"
        yield f"data: {json.dumps({'type': 'finish-step'})}\n\n"
        yield f"data: {json.dumps({'type': 'finish', 'finishReason': 'stop'})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "x-vercel-ai-ui-message-stream": "v1",
        },
    )
```

---

## 7. Implementación en Node.js / Express

```javascript
const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
app.use(express.json());

app.post("/Chat", async (req, res) => {
  const { messages } = req.body;

  // Headers obligatorios
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("x-vercel-ai-ui-message-stream", "v1");

  const partId = `part-${uuid().slice(0, 8)}`;

  function send(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  send({ type: "start" });
  send({ type: "start-step" });
  send({ type: "text-start", id: partId });

  // Simular streaming palabra por palabra
  const words = "¡Hola! Soy tu coach de vida.".split(" ");
  for (const word of words) {
    send({ type: "text-delta", id: partId, delta: word + " " });
    await new Promise((r) => setTimeout(r, 30));
  }

  send({ type: "text-end", id: partId });
  send({ type: "finish-step" });
  send({ type: "finish", finishReason: "stop" });

  res.end();
});
```

---

## 8. Errores Comunes y Soluciones

### ❌ Error: `Type validation failed: "message-start"`

**Causa**: Estás usando tipos inventados que no existen en el protocolo.

**Solución**: Solo usar los tipos válidos: `start`, `start-step`, `text-start`, `text-delta`, `text-end`, `finish-step`, `finish`, `error`.

---

### ❌ Error: `Unrecognized keys: "finishReason", "usage"` en `finish-step`

**Causa**: `finish-step` NO acepta campos extra.

**Solución**: Enviar solo `{"type": "finish-step"}` sin nada más.

---

### ❌ Error: `Unrecognized key: "usage"` en `finish`

**Causa**: `finish` acepta `finishReason` pero NO `usage`.

**Solución**: Enviar `{"type": "finish", "finishReason": "stop"}` sin `usage`.

---

### ❌ Error: `Unrecognized key: "id"` en `start` o `finish`

**Causa**: Solo `text-start`, `text-delta` y `text-end` llevan `id`.

**Solución**: No poner `id` en `start`, `start-step`, `finish-step` ni `finish`.

---

### ❌ El chat muestra "Thinking..." pero nunca muestra texto

**Causa**: El header `x-vercel-ai-ui-message-stream: v1` falta o está mal escrito.

**Solución**: Verificar que el response incluye exactamente:
```
x-vercel-ai-ui-message-stream: v1
```

---

### ❌ Error: `Error de comunicación con el servidor de IA`

**Causa**: El proxy de Next.js (`app/api/chat/route.ts`) no puede conectarse al backend.

**Solución**: Verificar que `FASTAPI_BASE_URL` en `.env.local` apunta a la URL correcta del backend y que este está corriendo.

---

## 9. Referencia Rápida

### Headers del Response (copiar y pegar)

```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
x-vercel-ai-ui-message-stream: v1
```

### Stream mínimo funcional (copiar y pegar)

```
data: {"type":"start"}

data: {"type":"start-step"}

data: {"type":"text-start","id":"part-001"}

data: {"type":"text-delta","id":"part-001","delta":"Hola mundo"}

data: {"type":"text-end","id":"part-001"}

data: {"type":"finish-step"}

data: {"type":"finish","finishReason":"stop"}

```

### Checklist para el backend

- [ ] Endpoint recibe `POST` con body `{ messages: [...] }`
- [ ] Response es `Content-Type: text/event-stream`
- [ ] Header `x-vercel-ai-ui-message-stream: v1` presente
- [ ] Cada evento empieza con `data: ` y termina con `\n\n`
- [ ] Los JSON son válidos (sin trailing commas, strings con comillas dobles)
- [ ] Secuencia correcta: `start → start-step → text-start → deltas → text-end → finish-step → finish`
- [ ] Los `text-delta` tienen `id` y `delta`
- [ ] `finish-step` NO tiene campos extra
- [ ] `finish` NO tiene `usage`
- [ ] El `id` en `text-start`, `text-delta` y `text-end` es el mismo

---

> 📝 **Nota**: Este documento fue generado a partir de pruebas reales con el laboratorio del frontend (branch `laboratorio`). El formato fue validado contra AI SDK `ai@6.0.116` + `@ai-sdk/react@3.0.118`.
