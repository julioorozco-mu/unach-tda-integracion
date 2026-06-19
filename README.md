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

## ⚙️ Configuración Inicial

1. **Instalar dependencias**:
   Instala todas las librerías necesarias con el siguiente comando:
   ```bash
   npm install
   ```

2. **Variables de entorno**:
   Debes crear un archivo llamado `.env` en la raíz del proyecto. Este archivo debe contener la configuración de Supabase y las URLs de la TDA. 

   Ejemplo de contenido para el archivo `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="tu_url_de_supabase"
   SUPABASE_SERVICE_ROLE_KEY="tu_key_de_servicio"
   TDA_ENROLL_URL="https://catalog.techdiplomacyacademy.org/es/..."
   ```

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
