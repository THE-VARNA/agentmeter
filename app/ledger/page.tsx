import { LedgerClient } from "@/components/ledger/ledger-client";
import { getLedger } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function LedgerPage() {
  return <LedgerClient initialLedger={getLedger()} />;
}
