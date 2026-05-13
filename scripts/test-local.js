async function test() {
  const baseUrl = "http://localhost:3000";
  
  const testEndpoint = async (path, expectedStatus = 200, method = "GET", body = null) => {
    try {
      const options = { method };
      if (body) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(body);
      }
      const res = await fetch(baseUrl + path, options);
      console.log(`${method} ${path} -> ${res.status} (Expected: ${expectedStatus})`);
      if (res.status !== expectedStatus) {
        console.error(`  FAILED: expected ${expectedStatus}, got ${res.status}`);
        const text = await res.text();
        console.error(`  Response: ${text.substring(0, 200)}`);
      }
    } catch (e) {
      console.error(`Error fetching ${path}: ${e.message}`);
    }
  };

  await testEndpoint("/");
  await testEndpoint("/dashboard");
  await testEndpoint("/api/demo/state");
  await testEndpoint("/gateway/weather-alpha", 402);
  await testEndpoint("/gateway/risk-score", 402);
  await testEndpoint("/api/demo/run", 200, "POST", { endpointSlug: "weather-alpha" });
}
test();
