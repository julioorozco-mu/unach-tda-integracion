import { chromium } from "playwright";
import { makePassword } from "./lib/tda-worker.ts";

const email = "unach.temp.914258@yopmail.com";
const password = makePassword(email);
const loginUrl = "https://login.techdiplomacyacademy.org/";

async function main() {
  console.log(`Iniciando sesión para ${email}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Vamos a la página de login
  await page.goto("https://catalog.techdiplomacyacademy.org/es/intro-tech-diplomacy");
  await page.click('text="Log In"');
  await page.waitForURL(/login\.techdiplomacyacademy\.org/);
  
  // Llenamos credenciales
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[value="default"]');
  
  // Esperamos que termine el login y cargue la página
  console.log("Esperando redirección al panel...");
  await page.waitForSelector('text="Dashboard for:"');
  console.log("¡Sesión iniciada con éxito!");
  console.log("URL final del panel:", page.url());
  
  await browser.close();
}

main().catch(console.error);
