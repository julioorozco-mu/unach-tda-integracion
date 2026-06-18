import { Queue } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { parseRegistration } from "../../../lib/registration";

export const runtime = "nodejs";

const queue = new Queue("registro-tda", {
  connection: { host: "localhost", port: 6380 },
});

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Supabase no configurado" }, { status: 500 });
    }

    const registro = parseRegistration(await request.json());
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from("usuarios_cursos").insert(registro);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    await queue.add("registro-tda", registro);

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registro invalido";
    return Response.json({ error: message }, { status: 400 });
  }
}
