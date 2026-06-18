import { roles, type RegistrationRole } from "./registration.ts";

export type TdaJobData = {
  email?: string;
  correo?: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
};

export type TdaUser = {
  email: string;
  nombre: string;
  apellidos: string;
  rol: RegistrationRole;
  password: string;
  tdaRole: string;
};

const roleLabels: Record<RegistrationRole, string> = {
  Student: "Student",
  Teacher: "Teacher",
  External: "External",
};

export function makePassword(email: string) {
  return `${email.split("@")[0]}Unach2026!`;
}

export function mapTdaRole(rol: string) {
  const role = rol.trim();

  if (!roles.includes(role as RegistrationRole)) {
    throw new Error("Rol TDA invalido");
  }

  return roleLabels[role as RegistrationRole];
}

export function buildTdaUser(data: TdaJobData): TdaUser {
  const email = (data.email ?? data.correo ?? "").trim().toLowerCase();
  const nombre = (data.nombre ?? "").trim();
  const apellidos = (data.apellidos ?? "").trim();
  const rol = (data.rol ?? "").trim();

  if (!email || !nombre || !apellidos || !rol) {
    throw new Error("Job registro-tda incompleto");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email TDA invalido");
  }

  if (!roles.includes(rol as RegistrationRole)) {
    throw new Error("Rol TDA invalido");
  }

  return {
    email,
    nombre,
    apellidos,
    rol: rol as RegistrationRole,
    password: makePassword(email),
    tdaRole: mapTdaRole(rol),
  };
}
