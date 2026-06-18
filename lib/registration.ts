export const roles = ["Student", "Teacher", "External"] as const;

export type RegistrationRole = (typeof roles)[number];

export type RegistrationInput = {
  matricula: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
};

export type RegistrationRecord = Omit<RegistrationInput, "rol"> & {
  rol: RegistrationRole;
  inscripcion_tda: "pendiente";
};

export function parseRegistration(input: RegistrationInput): RegistrationRecord {
  const record = {
    matricula: input.matricula.trim(),
    nombre: input.nombre.trim(),
    apellidos: input.apellidos.trim(),
    correo: input.correo.trim().toLowerCase(),
    rol: input.rol.trim(),
  };

  if (!record.matricula || !record.nombre || !record.apellidos || !record.correo) {
    throw new Error("Todos los campos son requeridos");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.correo)) {
    throw new Error("Correo invalido");
  }

  if (!roles.includes(record.rol as RegistrationRole)) {
    throw new Error("Rol invalido");
  }

  return {
    ...record,
    rol: record.rol as RegistrationRole,
    inscripcion_tda: "pendiente",
  };
}
