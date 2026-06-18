import assert from "node:assert/strict";
import { test } from "node:test";
import { buildTdaUser, makePassword, mapTdaRole } from "../lib/tda-worker.ts";

test("makePassword uses the email prefix and standard suffix", () => {
  assert.equal(makePassword("ana.ruiz@unach.mx"), "ana.ruizUnach2026!");
});

test("buildTdaUser accepts correo payloads from the API job", () => {
  assert.deepEqual(
    buildTdaUser({
      correo: " ANA.RUIZ@UNACH.MX ",
      nombre: " Ana ",
      apellidos: " Ruiz Lopez ",
      rol: "Student",
    }),
    {
      email: "ana.ruiz@unach.mx",
      nombre: "Ana",
      apellidos: "Ruiz Lopez",
      rol: "Student",
      password: "ana.ruizUnach2026!",
      tdaRole: "Student",
    },
  );
});

test("mapTdaRole rejects unknown roles", () => {
  assert.throws(() => mapTdaRole("Admin"), /Rol TDA invalido/);
});
