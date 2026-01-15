# Expense Tracker App

Aplicación web para la gestión básica de gastos personales, con autenticación, persistencia de sesión y dashboard interactivo.

El proyecto está dividido en dos partes:
- Backend API (NestJS + PostgreSQL)
- Frontend (Nuxt 3 + Nuxt UI)

---

## Tecnologías utilizadas

### Backend
NestJS
TypeORM
PostgreSQL
JWT (Access + Refresh Tokens)
Cookies HTTP-only
wagger (OpenAPI)
Docker (opcional en local)

### Frontend
Nuxt 3
Vue 3
Nuxt UI 4
Pinia
Tailwind CSS
Fetch API con manejo de sesión

---

## 📦 Estructura del repositorio

/
├── backend/
│ ├── src/
│ ├── migrations/
│ ├── seeds/
│ 
│
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── layouts/
│ ├── stores/
│ └── composables/

---
## ⚙️ Instalación local

Es importante clonar el repositorio 
git clone https://github.com/Pelony/pruebatecnicaLarissav1.git
Una vez clonado accedemos a la carpeta donde estara el proyecto
cd pruebatecnicaLarissav1
Es necesario instalar npm i en el backend como en el frontend
cd backend
npm install

cd frontend
npm install

Para correr la seed podemos usar este comando
npm run seed

Es importante colocar los dos archivos .env

#Para el backend este es el que se recomienda utilizar
NODE_ENV=development
PORT=3000

DB_HOST=db
DB_PORT=5432
DB_USER=app
DB_PASS=app
DB_NAME=app


DATABASE_URL=postgresql://app:app@postgres:5432/app
JWT_ACCESS_SECRET="super_access_secret"
JWT_REFRESH_SECRET="super_refresh_secret"
ACCESS_EXPIRES_IN="15m"
REFRESH_EXPIRES_IN="14d"


TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true


#Para el frontend se recomienda utilizar este
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
NUXT_API_INTERNAL_BASE_URL=http://localhost:3000

Y finalmente revisar en el backend el archivo de app.module.ts y comentar el apartado de ssl 
principalmente para que haga la conexion adecuada en la base de datos si no dara un problema con el ssl