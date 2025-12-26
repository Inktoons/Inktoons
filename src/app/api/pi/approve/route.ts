import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const timestamp = Date.now();
    try {
        const { paymentId } = await request.json();
        // Intentamos leer de todas las fuentes posibles
        const apiKey = (process.env.PI_API_KEY || process.env.NEXT_PUBLIC_PI_API_KEY || "").trim();

        if (!apiKey) {
            console.error("DEBUG: No API Key found in Vercel environment");
            return NextResponse.json({
                error: `[V3-${timestamp}] Server error: La llave API no ha sido cargada en Vercel. Por favor, revisa la configuración de variables de entorno.`
            }, { status: 500 });
        }

        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes("already_approved")) {
                return NextResponse.json({ success: true, message: "Pase libre" });
            }
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: `[V3-EX-${timestamp}] error interno` }, { status: 500 });
    }
}
