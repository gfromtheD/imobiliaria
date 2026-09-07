import { NextResponse } from "next/server";

import { getEmailProvider } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to") ?? "gfromthedclan@gmail.com";

  try {
    const emailProvider = getEmailProvider();
    const result = await emailProvider.sendEmail({
      to,
      subject: "Prueba Alpha Virtual Staging - Resend Integration",
      html: `
        <h1>Virtual Staging - Alpha Test</h1>
        <p>Este es un correo de prueba enviado mediante la integración automatizada de <strong>Resend</strong>.</p>
        <p>Estado del sistema: <strong>Alpha Ready (Modo Mock IA + Stripe Test + Resend)</strong>.</p>
      `,
      text: "Virtual Staging Alpha Test - Integración automatizada de Resend completada.",
    });

    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
