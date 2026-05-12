import { EndpointManager } from "@/components/endpoints/endpoint-manager";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function EndpointsPage() {
  return <EndpointManager initialEndpoints={getSerializableState().endpoints} />;
}
