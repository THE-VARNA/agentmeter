import { EndpointManager } from "@/components/endpoints/endpoint-manager";
import { getSerializableState } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function EndpointsPage() {
  const state = await getSerializableState();
  return <EndpointManager initialEndpoints={state.endpoints} />;
}
