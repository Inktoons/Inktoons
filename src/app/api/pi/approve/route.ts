import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const timestamp = new Date().toISOString();
    try {
        const { paymentId } = await request.json();
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        // LOG PARA DEBUG (Se ve en el panel de Vercel Logs)
        console.log(`[PI_PAYMENT_DEBUG] [${timestamp}]`);
        console.log(`- PaymentID: ${paymentId}`);
        console.log(`- API Key exists: ${apiKey ? "YES" : "NO"}`);
        if (apiKey) {
            console.log(`- API Key Length: ${apiKey.length}`);
            console.log(`- API Key Start: ${apiKey.substring(0, 4)}...`);
        }

        if (!apiKey) {
            return NextResponse.json({
                error: `[V4] Error de configuración: No se encontró la LLAVE_API en Vercel.`
            }, { status: 500 });
        }

        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        const responseText = await response.text();
        console.log(`- Pi API Response (${response.status}): ${responseText}`);

        if (!response.ok) {
            if (responseText.includes("already_approved")) {
                return NextResponse.json({ success: true, message: "OK" });
            }
            return NextResponse.json({ error: responseText }, { status: response.status });
        }

        return NextResponse.json(JSON.parse(responseText));
    } catch (error: any) {
        console.error("- Error crítico en API:", error);
        return NextResponse.json({ error: `[V4-ERROR] ${error.message}` }, { status: 500 });
    }
}
