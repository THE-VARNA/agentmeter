import { promises as fs } from "fs";
import { join } from "path";
import { execSync } from "child_process";

async function processFile(file: string) {
  const content = await fs.readFile(file, "utf8");
  let newContent = content;

  // Add async to Next.js page components
  if (file.endsWith("page.tsx")) {
    newContent = newContent.replace(/export default function (\w+)/, "export default async function $1");
  }

  // Add await to getStore() and getLedger()
  newContent = newContent.replace(/const store = getStore\(\)/g, "const store = await getStore()");
  newContent = newContent.replace(/const ledger = getLedger\(\)/g, "const ledger = await getLedger()");
  newContent = newContent.replace(/const state = getSerializableState\(\)/g, "const state = await getSerializableState()");

  if (content !== newContent) {
    await fs.writeFile(file, newContent, "utf8");
    console.log(`Updated ${file}`);
  }
}

async function run() {
  const output = execSync("git grep -l 'from \"@/lib/demo-data\"'", { encoding: "utf8" });
  const files = output.trim().split("\n");
  for (const file of files) {
    if (file && file !== "scripts/convert-to-async.ts") {
      await processFile(join(process.cwd(), file));
    }
  }
}

run().catch(console.error);
