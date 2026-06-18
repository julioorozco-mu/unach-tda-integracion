import { Worker, type Job } from "bullmq";
import { chromium, type Browser } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { buildTdaUser, type TdaJobData } from "../lib/tda-worker.ts";

const queueName = "registro-tda";
const connection = { host: "localhost", port: 6380 };
const enrollUrl =
  process.env.TDA_ENROLL_URL ?? "https://catalog.techdiplomacyacademy.org/es/intro-tech-diplomacy";

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

  try {
    browser = await chromium.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

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
    await page.click('button:has-text("Continue")');
    await page.selectOption('select[name="dropdown_job_function"]', { label: user.tdaRole });
    await page.selectOption('select[name="dropdown_industry"]', { label: "Student/Academic" });
    await page.selectOption('select[name="dropdown_sub_role"]', { label: user.tdaRole });
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text="Dashboard for:"');

    await markCompleted(user.email);
  } catch (error) {
    console.error(`Fallo registro-tda job ${job.id}:`, error);
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
