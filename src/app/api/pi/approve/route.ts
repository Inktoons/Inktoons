import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();
        const apiKey = process.env.PI_API_KEY;

        console.log("Approve request for paymentId:", paymentId);

        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Pi API Approve Error:", error);
            return NextResponse.json({ error }, { status: response.status });
        }

        const data = await response.json();
        console.log("Pi API Approve Success:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Internal Server Error (Approve):", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
