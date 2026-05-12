import { NextResponse } from "next/server";

import { CREDIT_PACKS } from "@/lib/constants";
import { getStore, recordCheckout } from "@/lib/demo-data";
import { createDodoCreditPackCheckout } from "@/lib/dodo";
import { creditPackSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const input = creditPackSchema.parse(await request.json());
    const store = getStore();
    const buyer = store.buyers.find((item) => item.id === input.buyerId);
    const pack = CREDIT_PACKS.find((item) => item.amountUsd === input.amountUsd);

    if (!buyer || !pack) {
      return NextResponse.json({ error: "buyer_or_pack_not_found" }, { status: 404 });
    }

    const checkout = await createDodoCreditPackCheckout(input);
    const record = recordCheckout({
      merchantId: store.merchant.id,
      buyerId: buyer.id,
      providerId: checkout.providerId,
      idempotencyKey: checkout.idempotencyKey,
      checkoutUrl: checkout.checkoutUrl ?? checkout.providerId ?? "pending",
      productId: checkout.productId,
      amountUsd: input.amountUsd,
      rawStatus: checkout.rawStatus,
      rawPayload: checkout.rawPayload
    });

    return NextResponse.json({ checkout: record, pack });
  } catch (error) {
    return NextResponse.json(
      {
        error: "checkout_creation_failed",
        detail: error instanceof Error ? error.message : "Unable to create checkout"
      },
      { status: 400 }
    );
  }
}
