'use client';

import { useState, useTransition } from "react";

type LogEntry = {
  id: string;
  direction: "incoming" | "outgoing";
  summary: string;
  timestamp: number;
};

type Props = {
  logs: LogEntry[];
};

const Dashboard = ({ logs }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const handleConfigureWebhook = async (formData: FormData) => {
    const mode = formData.get("mode");
    const body =
      mode === "delete"
        ? { mode: "delete" }
        : {
            webhookUrl: formData.get("webhookUrl"),
            secretToken: formData.get("secretToken") || undefined,
            dropPendingUpdates: formData.get("dropPendingUpdates") === "on",
            allowedUpdates: formData
              .get("allowedUpdates")
              ?.toString()
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean) ?? undefined
          };

    const response = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? "Webhook configuration failed");
    }
  };

  const handleSendMessage = async (formData: FormData) => {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: formData.get("chatId"),
        text: formData.get("text")
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? "Failed to send message");
    }
  };

  const resetAlerts = () => {
    setAlert(null);
    setSendStatus(null);
  };

  return (
    <>
      <section>
        <h1>Telegram Bot Command Center</h1>
        <p>
          Configure the webhook, send test messages, and monitor live Telegram updates. Provide the
          public URL that points to <code>/api/webhook</code> when setting up the webhook.
        </p>
      </section>

      {alert ? (
        <div className="card" style={{ borderColor: "rgba(34, 211, 238, 0.5)" }}>
          {alert}
        </div>
      ) : null}

      <section className="grid two">
        <div className="card">
          <h2>Webhook Configuration</h2>
          <p>Configure the Telegram webhook or tear it down.</p>
          <form
            action={(formData) =>
              startTransition(async () => {
                resetAlerts();
                try {
                  await handleConfigureWebhook(formData);
                  setAlert("Webhook updated successfully.");
                } catch (error) {
                  setAlert((error as Error).message);
                }
              })
            }
          >
            <label>
              Webhook URL
              <input
                name="webhookUrl"
                type="url"
                placeholder="https://agentic-686050a9.vercel.app/api/webhook"
              />
            </label>
            <label>
              Secret Token
              <input name="secretToken" type="text" placeholder="Optional secret token" />
            </label>
            <label>
              Allowed Updates
              <input
                name="allowedUpdates"
                type="text"
                placeholder="message, callback_query (comma separated)"
              />
            </label>
            <label>
              <input name="dropPendingUpdates" type="checkbox" /> Drop pending updates
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Apply Webhook"}
              </button>
              <button
                type="button"
                style={{ background: "#ef4444", color: "#0f172a" }}
                onClick={() =>
                  startTransition(async () => {
                    resetAlerts();
                    const form = new FormData();
                    form.set("mode", "delete");
                    try {
                      await handleConfigureWebhook(form);
                      setAlert("Webhook deleted.");
                    } catch (error) {
                      setAlert((error as Error).message);
                    }
                  })
                }
                disabled={isPending}
              >
                Delete Webhook
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Send Test Message</h2>
          <p>Deliver a message to a chat to confirm the bot is behaving as expected.</p>
          <form
            action={(formData) =>
              startTransition(async () => {
                resetAlerts();
                try {
                  await handleSendMessage(formData);
                  setSendStatus("Message sent successfully.");
                } catch (error) {
                  setSendStatus((error as Error).message);
                }
              })
            }
          >
            <label>
              Chat ID
              <input name="chatId" type="text" placeholder="123456789" required />
            </label>
            <label>
              Message
              <textarea
                name="text"
                placeholder="Hello from our Vercel-powered bot!"
                rows={4}
                required
              />
            </label>
            <button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send"}
            </button>
            {sendStatus ? <p style={{ color: "#22d3ee" }}>{sendStatus}</p> : null}
          </form>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="status">
            <span className="status-dot" />
            Live Webhook Activity
          </div>
          <ul className="history">
            {logs.length === 0 ? (
              <li>No activity logged yet.</li>
            ) : (
              logs.map((log) => (
                <li key={log.id}>
                  <strong>{log.direction === "incoming" ? "⬇ Incoming" : "⬆ Outgoing"}</strong>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span>{log.summary}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
