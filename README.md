# Integración UNACH - TDA (Tech Diplomacy Academy)

Este proyecto gestiona la integración entre la Universidad Autónoma de Chiapas (UNACH) y la plataforma de Tech Diplomacy Academy (TDA). Su propósito principal es facilitar y automatizar el registro de usuarios de la universidad en los cursos de la TDA.

El sistema se compone de una interfaz web frontend construida con Next.js y un worker en segundo plano (Node.js) que se encarga de automatizar tareas mediante Playwright y procesos en cola con BullMQ.

---

## 🛠️ Requisitos Previos

Asegúrate de contar con lo siguiente antes de ejecutar el proyecto:

- **Node.js**: Versión 20 o superior (el proyecto hace uso de flags nativos como `--env-file` y `--experimental-strip-types`).
- **Redis**: Necesario para el manejo de colas a través de BullMQ.
- **Supabase CLI** (Opcional, pero recomendado): Para correr la base de datos localmente.

---

## ⚙️ Instalación y Configuración Local (Guía desde cero)

Si acabas de clonar este repositorio en una nueva computadora, sigue estos pasos rigurosamente para asegurar que tanto la web como el worker funcionen:

### 1. Clonar e Instalar Dependencias
Primero clona el proyecto e instala los paquetes base de Node.js:
```bash
git clone https://github.com/julioorozco-mu/unach-tda-integracion.git
cd unach-tda-integracion
npm install
```

### 2. Instalar Navegadores de Playwright (Para el Worker)
El worker utiliza un navegador *headless* de Chromium para automatizar y simular el registro en la TDA. Si omites este paso, el worker fallará al arrancar.
```bash
npx playwright install chromium
```

### 3. Iniciar un Servidor Redis Local
BullMQ requiere una instancia de Redis corriendo. Por defecto, el worker busca Redis en el puerto **6380**.
La forma más rápida y limpia de levantarlo es usando Docker:
```bash
docker run -d -p 6380:6379 --name redis-unach redis
```
*(Si usas Redis de forma nativa o en la nube, deberás adaptar la configuración de conexión en `worker/registro-tda.ts`).*

### 4. Variables de Entorno (.env)
Crea un archivo llamado `.env` en la raíz del proyecto. El sistema requiere obligatoriamente acceso a Supabase y la URL de inscripción de la TDA.

```env
# Credenciales de Supabase (Base de datos principal)
NEXT_PUBLIC_SUPABASE_URL="https://[TU-ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-secreta"

# URL de Inscripción destino de TDA (Suele ser de HubSpot)
TDA_ENROLL_URL="https://catalog.techdiplomacyacademy.org/es/enroll-in-the-tech-diplomacy-academy-unach?hs_preview=TU_ID"
```

### 5. Iniciar la Base de Datos Local (Supabase CLI) - Opcional
Si vas a desarrollar de forma totalmente local (sin usar un proyecto en supabase.com), utiliza su CLI:
```bash
npx supabase start
```
*(Luego, sustituye los valores en tu `.env` con las URL's locales que la CLI imprime en tu terminal al terminar).*

---

## 🚀 Acciones y Comandos (Cómo ejecutar el proyecto)

Aquí se encuentran los comandos principales para poner en marcha las diferentes partes del sistema. Estos se ejecutan desde la terminal en la raíz del proyecto.

### 1. Iniciar la Interfaz Web (Frontend)
Para arrancar el servidor de desarrollo de la aplicación Next.js, ejecuta:

```bash
npm run dev
```
> Esto iniciará la interfaz de usuario. Por lo general, estará disponible en `http://localhost:3000`.

### 2. Iniciar el Worker (Procesos en Segundo Plano)
El worker es vital para procesar las tareas pesadas (como la automatización web y el registro en la TDA a través de colas de BullMQ). Para iniciarlo, ejecuta:

```bash
npm run worker
```
> **Nota:** Asegúrate de que el servidor de Redis esté en ejecución y que las credenciales correctas se encuentren en tu `.env` para que el worker pueda conectarse a la cola y ejecutar las tareas programadas por el frontend.

### 3. Ejecutar Pruebas
Si necesitas validar que los flujos principales funcionen correctamente, puedes correr la suite de pruebas nativas de Node.js:

```bash
npm test
```

### 4. Construir para Producción
Cuando estés listo para desplegar el proyecto, necesitas generar la versión optimizada de Next.js:

```bash
npm run build
```

---

## 📂 Estructura Principal

- `/app`: Contiene las rutas y páginas de la interfaz web en Next.js.
- `/components`: Componentes reutilizables de la interfaz de usuario (ej. overlays, animaciones).
- `/worker`: Contiene la lógica del worker (`registro-tda.ts`) encargado de automatizar el registro mediante Playwright.
- `/supabase`: Contiene configuraciones y migraciones relacionadas con la base de datos.
- `/tests`: Contiene los archivos de prueba para validar el comportamiento del código.
