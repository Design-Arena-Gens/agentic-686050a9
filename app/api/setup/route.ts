import { NextRequest } from "next/server";
import { addLog } from "@/lib/log-store";
import { deleteWebhook, setWebhook } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (payload.mode === "delete") {
      const result = await deleteWebhook();
      addLog({ direction: "outgoing", summary: "Deleted Telegram webhook" });
      return Response.json({ ok: true, data: result });
    }

    if (!payload.webhookUrl) {
      return Response.json({ ok: false, error: "webhookUrl is required" }, { status: 400 });
    }

    const result = await setWebhook({
      url: payload.webhookUrl,
      secretToken: payload.secretToken,
      dropPendingUpdates: payload.dropPendingUpdates,
      allowedUpdates: payload.allowedUpdates
    });

    addLog({
      direction: "outgoing",
      summary: `Configured webhook to ${payload.webhookUrl}`
    });

    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Webhook setup failed", error);
    return Response.json(
      { ok: false, error: (error as Error).message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
