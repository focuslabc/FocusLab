import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OFFER_PLAN_MAP: Record<string, string> = {
  "eNVmieH": "basic",
  "qb0saiO": "premium",
  "sKEFgEr": "gold",
};

Deno.serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = await req.json();

    // Validate webhook token from Kiwify (sent as query param or header)
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || req.headers.get("x-kiwify-token") || "";
    const expectedToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN") || "";

    if (expectedToken && token !== expectedToken) {
      console.error("Invalid webhook token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Log the webhook for debugging
    console.log("Kiwify webhook received:", JSON.stringify(body).substring(0, 500));

    // Extract data from Kiwify payload
    // Kiwify sends: order_id, order_status, Customer.email, Product, checkout_link, etc.
    const orderStatus = body.order_status || body.webhook_event_type || "";
    const orderId = body.order_id || body.id || "";
    const customerEmail = body.Customer?.email || body.customer?.email || body.buyer?.email || "";

    // Try to find offer_id from various Kiwify payload paths
    let offerId = "";
    
    // Check purchase.offer_id
    if (body.purchase?.offer_id) {
      offerId = body.purchase.offer_id;
    }
    // Check Product.product_id  
    else if (body.Product?.product_id) {
      offerId = body.Product.product_id;
    }
    // Check checkout_link for offer code
    else if (body.checkout_link || body.Subscription?.plan?.id) {
      const link = body.checkout_link || "";
      // Extract the last segment of the checkout URL
      const segments = link.split("/").filter(Boolean);
      offerId = segments[segments.length - 1] || body.Subscription?.plan?.id || "";
    }
    // Check product_id
    else if (body.product_id) {
      offerId = body.product_id;
    }

    if (!customerEmail) {
      console.error("No customer email found in webhook payload");
      return new Response(JSON.stringify({ error: "Missing customer email" }), { status: 400 });
    }

    // Determine the plan from the offer
    const plan = OFFER_PLAN_MAP[offerId] || "basic";
    
    // Check if this is an approved/paid event
    const isPaid = ["paid", "approved", "compra_aprovada"].includes(orderStatus.toLowerCase());
    const isCanceled = ["refunded", "canceled", "compra_reembolsada", "chargeback", "subscription_canceled"].includes(orderStatus.toLowerCase());

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (isPaid) {
      // Find user by email
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error("Error listing users:", userError);
        return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
      }

      const user = users.users.find(
        (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );

      if (!user) {
        console.error(`User not found for email: ${customerEmail}`);
        // Still save the subscription for later reconciliation
        await supabase.from("subscriptions").upsert({
          kiwify_order_id: orderId,
          user_id: "00000000-0000-0000-0000-000000000000",
          plan,
          status: "pending_user",
          offer_id: offerId,
          customer_email: customerEmail,
        }, { onConflict: "kiwify_order_id" });

        return new Response(JSON.stringify({ ok: true, message: "Subscription saved, user not found yet" }), { status: 200 });
      }

      // Save subscription record
      await supabase.from("subscriptions").upsert({
        kiwify_order_id: orderId,
        user_id: user.id,
        plan,
        status: "active",
        offer_id: offerId,
        customer_email: customerEmail,
      }, { onConflict: "kiwify_order_id" });

      // Update user profile with the plan
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ plan, is_premium: plan !== "free" })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500 });
      }

      console.log(`User ${user.id} upgraded to plan: ${plan}`);
      return new Response(JSON.stringify({ ok: true, plan, user_id: user.id }), { status: 200 });

    } else if (isCanceled) {
      // Handle cancellation/refund - downgrade to free
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users.find(
        (u) => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );

      if (user) {
        await supabase.from("subscriptions").upsert({
          kiwify_order_id: orderId,
          user_id: user.id,
          plan: "free",
          status: "canceled",
          offer_id: offerId,
          customer_email: customerEmail,
        }, { onConflict: "kiwify_order_id" });

        await supabase
          .from("profiles")
          .update({ plan: "free", is_premium: false })
          .eq("user_id", user.id);

        console.log(`User ${user.id} downgraded to free`);
      }

      return new Response(JSON.stringify({ ok: true, action: "downgraded" }), { status: 200 });

    } else {
      // Other events (boleto_gerado, pix_gerado, etc.) - just log
      console.log(`Received event: ${orderStatus} for ${customerEmail}`);
      return new Response(JSON.stringify({ ok: true, event: orderStatus }), { status: 200 });
    }

  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
