import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();
        let apiKey = process.env.PI_API_KEY?.trim() || process.env.NEXT_PUBLIC_PI_API_KEY?.trim();

        if (!apiKey) {
            console.error("PI_API_KEY and NEXT_PUBLIC_PI_API_KEY are both missing in environment variables");
            return NextResponse.json({ error: "Server configuration error: Missing API Key on Vercel" }, { status: 500 });
        }

        console.log(`Approve request for paymentId: ${paymentId}`);
        console.log(`API Key loaded | Length: ${apiKey.length} | Prefix: ${apiKey.substring(0, 4)}...`);

        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Pi API Approve Error:", errorText);

            // Si ya está aprobado, devolvemos éxito para no bloquear el flujo
            if (errorText.includes("already_approved")) {
                console.log("Payment was already approved.");
                return NextResponse.json({ success: true, message: "Already approved" });
            }

            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        console.log("Pi API Approve Success:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Internal Server Error (Approve):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
