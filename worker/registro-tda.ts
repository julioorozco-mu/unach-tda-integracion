process.loadEnvFile();

import { Worker, type Job } from "bullmq";
import { chromium, type Browser } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { buildTdaUser, type TdaJobData } from "../lib/tda-worker.ts";
import fs from "node:fs";

const queueName = "registro-tda";
const connection = { host: "localhost", port: 6380 };
const enrollUrl =
  process.env.TDA_ENROLL_URL ?? "https://catalog.techdiplomacyacademy.org/es/intro-tech-diplomacy";

console.log("URL de inscripción configurada:", enrollUrl);

async function markCompleted(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase no configurado");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error } = await supabase
    .from("usuarios_cursos")
    .update({ inscripcion_tda: "completada" })
    .eq("correo", email);

  if (error) {
    throw new Error(error.message);
  }
}

async function processRegistration(job: Job<TdaJobData>) {
  const user = buildTdaUser(job.data);
  let browser: Browser | undefined;
  let page;

  try {
    browser = await chromium.launch({ headless: true, slowMo: 50 });
    page = await browser.newPage();

    await page.goto(enrollUrl, { waitUntil: "domcontentloaded" });
    await page.click('text="Inscríbase gratis"');
    await page.waitForURL(/login\.techdiplomacyacademy\.org/);
    await page.click('a[href*="signup"]');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[value="default"]');
    await page.fill('input[name="first_name"]', user.nombre);
    await page.fill('input[name="last_name"]', user.apellidos);
    await page.check('input[name="legal_mMeL"]');
    await page.click('button:has-text("Continue"):visible');
    // Mapear los valores de los dropdowns para TDA de forma robusta
    const jobFunctionValue = "Student/Academic";
    const industryValue = "Policy";
    const subRoleValue = user.rol === "Teacher" ? "teacher" : "student";

    console.log(`Seleccionando opciones en TDA: job_function=${jobFunctionValue}, industry=${industryValue}, sub_role=${subRoleValue}`);

    await page.locator('select[name="dropdown_job_function"]').evaluate((el: HTMLSelectElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, jobFunctionValue);

    await page.locator('select[name="dropdown_industry"]').evaluate((el: HTMLSelectElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, industryValue);

    await page.locator('select[name="dropdown_sub_role"]').evaluate((el: HTMLSelectElement, val) => {
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, subRoleValue);

    // Darle un pequeño respiro para que el estado de React se actualice
    await page.waitForTimeout(500);

    await page.click('button:has-text("Continue"):visible');

    // Esperar a que la página cargue tras el login/registro.
    // Podría redirigir directamente al Dashboard o a la página del curso/programa con el botón "Enroll" / "Inscribirse".
    try {
      const result = await Promise.race([
        page.waitForURL(/dashboard|tech-primer-series|catalog\.techdiplomacyacademy\.org/, { timeout: 15000 }).then(() => "success_url"),
        page.waitForSelector('.enrollment-button, button:has-text("Enroll"), a:has-text("Enroll"), button:has-text("Inscribirse"), a:has-text("Inscribirse"), button:has-text("Inscríbase"), a:has-text("Inscríbase")', { timeout: 15000 }).then(() => "enroll_button")
      ]);

      if (result === "enroll_button") {
        console.log("Detectado botón de inscripción, haciendo click...");
        await page.waitForTimeout(2000); // Dar tiempo a que el Javascript de HubSpot asigne el evento de click al enlace href=""
        const enrollBtn = page.locator('.enrollment-button, button:has-text("Enroll"), a:has-text("Enroll"), button:has-text("Inscribirse"), a:has-text("Inscribirse"), button:has-text("Inscríbase"), a:has-text("Inscríbase")').first();
        await enrollBtn.click();
        console.log("Click realizado. Esperando redirección...");
        await page.waitForURL(/dashboard|tech-primer-series|catalog\.techdiplomacyacademy\.org/, { timeout: 15000 });
      }
    } catch (e) {
      console.log("No se pudo detectar el dashboard o el botón de inscripción en el primer intento. Esperando por redirección final...", e);
      await page.waitForURL(/dashboard|tech-primer-series|catalog\.techdiplomacyacademy\.org/, { timeout: 15000 });
    }

    console.log("Inscripción completada con éxito. URL final:", page.url());
    await markCompleted(user.email);
  } catch (error) {
    console.error(`Fallo registro-tda job ${job.id}:`, error);
    if (page) {
      try {
        await page.screenshot({ path: 'worker-error.png', fullPage: true });
        const html = await page.content();
        fs.writeFileSync('worker-error.html', html);
      } catch (err) {
        console.error("Error al guardar capturas/html en el bloque catch:", err);
      }
    }
    throw error;
  } finally {
    await browser?.close();
  }
}

const worker = new Worker<TdaJobData>(queueName, processRegistration, { connection });

worker.on("completed", (job) => {
  console.log(`registro-tda completado: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`registro-tda fallido: ${job?.id}`, error);
});

console.log(`Worker ${queueName} escuchando Redis ${connection.host}:${connection.port}`);
