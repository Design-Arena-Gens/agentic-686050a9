import { NextRequest } from "next/server";
import { addLog } from "@/lib/log-store";
import { sendMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload.chatId) {
      return Response.json({ ok: false, error: "chatId is required" }, { status: 400 });
    }

    if (!payload.text) {
      return Response.json({ ok: false, error: "text is required" }, { status: 400 });
    }

    const result = await sendMessage(payload.chatId, payload.text);
    addLog({
      direction: "outgoing",
      summary: `Sent message to chat ${payload.chatId}: ${payload.text.slice(0, 120)}`
    });

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Failed to send message", error);
    return Response.json(
      { ok: false, error: (error as Error).message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
