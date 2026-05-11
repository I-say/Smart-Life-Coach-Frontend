# Smart-Life-Coach-Frontend

A frontend module for the project Smart Life Coach.

## .env.template

Para manejar el archivo con las variables de entorno recomiendo copiar el template y duplicarlo en un archivo `.env.local` para probar en PC o `.env.production` para probar en docker

## Docker

Para montar la imagen de Docker estando en la carpeta frontend vamos a ejecutar estos dos comandos (obviamente debes tener Docker instalado y corriendo):

```bash
docker build -t nextjs-app .
```

```bash
docker run -p 3000:3000 \
  --name mi-app-nextjs \
  --add-host host.docker.internal:host-gateway \
  --env-file .env.local \
  -e SUPABASE_SERVER_URL=http://host.docker.internal:54321 \
  -e FASTAPI_BASE_URL=http://host.docker.internal:8000 \
  nextjs-app
```

# NextJS Docs

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Correr en Local

Primero montar el db y agregar al .env.local (o .env.production) la URL de FastAPI (Suele ser http://localhost:8000), la de supabase (Suerle ser http://127.0.0.1:54321) y la clave publica (sb*publishable*...)

En la carpeta frontend/:

```bash
npm install
```

```bash
npm run dev
```
