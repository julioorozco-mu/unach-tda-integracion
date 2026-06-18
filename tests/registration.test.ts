import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRegistration } from "../lib/registration.ts";

test("parseRegistration trims valid registration data", () => {
  assert.deepEqual(
    parseRegistration({
      matricula: " A123 ",
      nombre: " Ana ",
      apellidos: " Ruiz Lopez ",
      correo: " ANA@UNACH.MX ",
      rol: "Student",
    }),
    {
      matricula: "A123",
      nombre: "Ana",
      apellidos: "Ruiz Lopez",
      correo: "ana@unach.mx",
      rol: "Student",
      inscripcion_tda: "pendiente",
    },
  );
});

test("parseRegistration rejects invalid roles", () => {
  assert.throws(
    () =>
      parseRegistration({
        matricula: "A123",
        nombre: "Ana",
        apellidos: "Ruiz",
        correo: "ana@unach.mx",
        rol: "Admin",
      }),
    /Rol invalido/,
  );
});
