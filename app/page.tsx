"use client";

import { FormEvent, useState } from "react";
import { roles, type RegistrationInput } from "../lib/registration";
import { RedirectCountdownOverlay } from "../components/RedirectCountdownOverlay";

const emptyForm: RegistrationInput = {
  matricula: "",
  nombre: "",
  apellidos: "",
  correo: "",
  rol: "Student",
};

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<{ correo: string; clave: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const prefix = form.correo.split("@")[0].trim().toLowerCase();
    const generatedClave = `${prefix}Unach2026!`;

    // Intentamos copiar la contraseña inmediatamente al hacer click en "Registrar"
    // ya que el navegador requiere un evento de usuario directo para usar el portapapeles.
    try {
      await navigator.clipboard.writeText(generatedClave);
    } catch (err) {
      console.error("No se pudo copiar preventivamente:", err);
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "No se pudo completar el registro");
      return;
    }

    setCredentials({
      correo: form.correo.trim().toLowerCase(),
      clave: generatedClave,
    });

    setStatus("ok");
    setMessage("");
  }

  const targetUrl = "https://courses.techdiplomacyacademy.org/dashboard";

  async function handleLoginRedirect() {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.clave);
    } catch (err) {
      console.error("No se pudo copiar la contraseña automáticamente:", err);
    } finally {
      window.location.href = targetUrl;
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6fb] px-5 py-6 text-[#201b27] sm:px-8 lg:px-12">
      <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="md:col-span-2 rounded-[8px] bg-[#2b1a3f] p-8 text-[#faf7ff] shadow-sm sm:p-10">
            <p className="mb-5 text-sm font-semibold text-purple-200">Headless LMS</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              Registro asincrono para cursos TDA.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#ded4ec] sm:text-lg">
              Captura usuarios, guarda el estado pendiente y dispara el proceso de integracion sin bloquear al alumno.
            </p>
          </article>

          <article className="rounded-[8px] bg-[#ffe08a] p-6 text-[#2a2110]">
            <p className="text-sm font-bold">Cola Redis</p>
            <p className="mt-6 text-3xl font-black">BullMQ</p>
            <p className="mt-2 text-sm leading-6">Sincronizacion TDA fuera del request.</p>
          </article>

          <article className="rounded-[8px] bg-[#dff7ea] p-6 text-[#102719]">
            <p className="text-sm font-bold">Supabase</p>
            <p className="mt-6 text-3xl font-black">pendiente</p>
            <p className="mt-2 text-sm leading-6">Registros listos para el worker.</p>
          </article>

          <article className="md:col-span-2 overflow-hidden rounded-[8px] bg-[#ede7f6] p-0">
            <div className="grid grid-cols-3 gap-1 p-3">
              {["Student", "Teacher", "External", "API", "Queue", "TDA"].map((item) => (
                <div key={item} className="rounded-[6px] bg-[#faf7ff] p-4 text-center text-sm font-bold text-[#4b355f]">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>

        <section className="rounded-[8px] bg-[#faf7ff] p-6 shadow-sm ring-1 ring-[#e5dced] sm:p-8">
          {status === "ok" && credentials ? (
            <div className="flex flex-col h-full justify-between min-h-[400px]">
              <div>
                <p className="text-sm font-bold text-purple-700">Inscripcion Completada</p>
                <h2 className="mt-2 text-2xl font-black mb-6">¡Tu cuenta ha sido creada!</h2>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Tu cuenta en TDA ha sido pre-registrada con éxito. Usa las siguientes credenciales para acceder a la plataforma:
                </p>

                <div className="grid gap-3 bg-[#f5efff] p-4 rounded-[6px] border border-[#e2d5f3] mb-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold text-[#6b5585] uppercase tracking-wider mb-1">Correo de acceso</span>
                    <span className="font-mono text-base font-semibold break-all text-[#201b27]">{credentials.correo}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#6b5585] uppercase tracking-wider mb-1">Contraseña temporal</span>
                    <span className="font-mono text-base font-semibold break-all bg-white px-2 py-1 rounded border border-[#e2d5f3] inline-block text-[#201b27]">
                      {credentials.clave}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full h-12 rounded-[8px] bg-purple-600 px-5 font-bold text-white transition hover:bg-purple-700 flex items-center justify-center cursor-pointer"
                >
                  Copiar contraseña e Ir a Cursos
                </button>
                <p className="text-xs text-center text-gray-500 leading-normal">
                  * Al hacer clic, la contraseña se copiará automáticamente al portapapeles y se te redirigirá a la pantalla de inicio de sesión de TDA.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-sm font-bold text-purple-700">Inscripcion</p>
                <h2 className="mt-2 text-2xl font-black">Datos del usuario</h2>
              </div>

              <form className="grid gap-4" onSubmit={onSubmit}>
                <Field label="Matricula" name="matricula" value={form.matricula} setForm={setForm} />
                <Field label="Nombre" name="nombre" value={form.nombre} setForm={setForm} />
                <Field label="Apellidos" name="apellidos" value={form.apellidos} setForm={setForm} />
                <Field label="Correo" name="correo" type="email" value={form.correo} setForm={setForm} />

                <label className="grid gap-2 text-sm font-semibold">
                  Rol
                  <select
                    className="h-12 rounded-[8px] border border-[#d8cde4] bg-[#fdfbff] px-3 outline-none ring-purple-600 transition focus:ring-2"
                    value={form.rol}
                    onChange={(event) => setForm((current) => ({ ...current, rol: event.target.value }))}
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </label>

                <button
                  className="mt-2 h-12 rounded-[8px] bg-purple-600 px-5 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-700 disabled:opacity-80"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Enviando..." : "Registrar usuario"}
                </button>

                {message ? (
                  <p className={status === "error" ? "text-sm font-semibold text-red-700" : "text-sm font-semibold text-purple-700"}>
                    {message}
                  </p>
                ) : null}
              </form>
            </>
          )}
        </section>
      </section>

      <RedirectCountdownOverlay 
        open={status === "ok"} 
        seconds={15}
        targetUrl={targetUrl}
        onComplete={handleLoginRedirect}
        onSkip={handleLoginRedirect}
      />
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  setForm,
}: {
  label: string;
  name: keyof Omit<RegistrationInput, "rol">;
  type?: string;
  value: string;
  setForm: React.Dispatch<React.SetStateAction<RegistrationInput>>;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className="h-12 rounded-[8px] border border-[#d8cde4] bg-[#fdfbff] px-3 outline-none ring-purple-600 transition focus:ring-2"
        name={name}
        required
        type={type}
        value={value}
        onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
      />
    </label>
  );
}
