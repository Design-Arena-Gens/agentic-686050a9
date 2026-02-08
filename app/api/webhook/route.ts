import { NextRequest } from "next/server";
import { handleIncomingUpdate, respondWithOk, verifyTelegramSecret } from "@/lib/webhook";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  if (!verifyTelegramSecret(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await handleIncomingUpdate(req);
  } catch (error) {
    console.error("Failed to handle update", error);
    return new Response("Bad Request", { status: 400 });
  }

  return respondWithOk();
}
