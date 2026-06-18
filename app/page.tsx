"use client";

import { FormEvent, useState } from "react";
import { roles, type RegistrationInput } from "../lib/registration";

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

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

    setStatus("ok");
    setMessage("Registro recibido. La inscripcion TDA queda pendiente.");
    setForm(emptyForm);
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
        </section>
      </section>
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
