import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getStore } from "@/lib/demo-data";
import { createDodoSubscriptionCheckout, createOrGetDodoCustomer } from "@/lib/dodo";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId } = body;

    const store = await getStore();
    const plan = SUBSCRIPTION_PLANS.find((p) => p.productId === productId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // We use the first buyer from the demo seed as the active user
    const buyer = store.buyers[0];
    if (!buyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    // Ensure we have a real Dodo customer ID
    const customer = await createOrGetDodoCustomer({
      email: buyer.email,
      name: buyer.name,
      existingCustomerId: buyer.dodoCustomerId.startsWith("demo_cus_") ? undefined : buyer.dodoCustomerId
    });

    if (customer.customerId !== buyer.dodoCustomerId) {
      await prisma.buyer.update({
        where: { id: buyer.id },
        data: { dodoCustomerId: customer.customerId }
      });
    }

    const checkout = await createDodoSubscriptionCheckout({
      buyerId: buyer.id,
      productId: plan.productId,
      amountUsd: plan.amountUsd,
      dodoCustomerId: customer.customerId
    });

    await prisma.dodoCheckout.create({
      data: {
        merchantId: store.merchant.id,
        buyerId: buyer.id,
        providerId: checkout.providerId,
        idempotencyKey: checkout.idempotencyKey,
        checkoutUrl: checkout.checkoutUrl ?? "",
        productId: checkout.productId,
        amountUsd: checkout.amountUsd,
        rawStatus: checkout.rawStatus,
        rawPayload: checkout.rawPayload as any
      }
    });

    return NextResponse.json({ checkoutUrl: checkout.checkoutUrl });
  } catch (error) {
    console.error("Dodo subscription checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
