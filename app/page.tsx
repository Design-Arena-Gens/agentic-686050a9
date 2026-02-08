import Dashboard from "@/components/dashboard";
import { getLogs } from "@/lib/log-store";

export const dynamic = "force-dynamic";

export default async function Page() {
  const logs = getLogs();
  return (
    <main>
      <Dashboard logs={logs} />
    </main>
  );
}
