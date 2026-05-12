import { promises as fs } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const methods = [
  "recordGatewayRequest",
  "recordX402Payment",
  "recordCheckout",
  "recordWebhook",
  "adjustCredits",
  "recordDemoRun",
  "addEndpoint"
];

async function processFile(file: string) {
  const content = await fs.readFile(file, "utf8");
  let newContent = content;

  for (const method of methods) {
    // Only replace instances that are function calls and don't already have await
    const regex = new RegExp(`(?<!await\\s)(?<!function\\s)(?<!export async function\\s)(${method}\\()`, "g");
    newContent = newContent.replace(regex, "await $1");
  }

  if (content !== newContent) {
    await fs.writeFile(file, newContent, "utf8");
    console.log(`Updated ${file}`);
  }
}

async function run() {
  const output = execSync("git grep -E -l 'recordGatewayRequest|recordX402Payment|recordCheckout|recordWebhook|adjustCredits|recordDemoRun|addEndpoint'", { encoding: "utf8" });
  const files = output.trim().split("\n");
  for (const file of files) {
    if (file && !file.includes("lib/demo-data.ts") && !file.includes("scripts/add-awaits.ts")) {
      await processFile(join(process.cwd(), file));
    }
  }
}

run().catch(console.error);
