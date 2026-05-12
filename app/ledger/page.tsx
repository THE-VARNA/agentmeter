import { LedgerClient } from "@/components/ledger/ledger-client";
import { getLedger } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const ledger = await getLedger();
  return <LedgerClient initialLedger={ledger} />;
}
