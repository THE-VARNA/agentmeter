import DodoPayments from "dodopayments";
const client = new DodoPayments({ bearerToken: "test", environment: "test_mode" });
try {
  client.webhooks.unwrap("{}", { "webhook-id": "1", "webhook-timestamp": "1", "webhook-signature": "1" }, "secret");
  console.log("unwrap signature accepted");
} catch(e) {
  console.log("unwrap error:", e.message);
}
