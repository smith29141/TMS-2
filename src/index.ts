import path from "node:path";
import { PipelineMain } from "./core/PipelineMain.js";
import { PiiProcessor } from "./security/PiiProcessor.js";
import { QwenClient } from "./clients/QwenClient.js";
import { FilesUtil } from "./utils/FilesUtil.js";
import { PromptEngine } from "./core/PromptEngine.js";

const templatePath = process.argv[2] ?? path.resolve(process.cwd(), "prompts", "01_checklist.txt");
const outputPath = process.argv[3] ?? path.resolve(process.cwd(), "generated", "total_prompt.txt");

console.log("=== PIPELINE STARTED ===");

//STAGE 1: Generate prompt from template and write it to the output file.
console.log("[STAGE 1] Generating prompt from template...");
await PipelineMain.run({ templatePath, outputPath });
console.log("[STAGE 1] Done -> ", outputPath);

//STAGE 2: PII SCAN & MASC
console.log("[STAGE 2] Running PII scan & masking...");
const raw = await FilesUtil.readTextFile(outputPath);
const masked = await PiiProcessor.mask(raw);
await FilesUtil.writeTextFile(outputPath, masked);
console.log("[STAGE 2] Done -> ", outputPath);

//STAGE 3: Send prompt to Qwen API and get response.
console.log("[STAGE 3] Sending prompt to Qwen API...");
const client = QwenClient.fromEnv();
const { content: response, raw: rawResponse } = await client.generateRaw(masked);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "generated", "ai_output.txt"), response);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "generated", "scenarios_raw.json"), JSON.stringify(rawResponse, null, 2));
console.log("[STAGE 3] Done -> generated/ai_output.txt, generated/scenarios_raw.json");

//STAGE 4: Generate json testcases
console.log("[STAGE 4] Generating testcases JSON...");
const testcasesPrompt = await PromptEngine.buildPromptFromFile(
  path.resolve(process.cwd(), "prompts", "02_testcases_json.txt"),
  { SCENARIOS: response }
);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "generated", "testcases_prompt.txt"), testcasesPrompt);
const { content: testcasesContent, raw: testcasesRaw } = await client.generateRaw(testcasesPrompt);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "generated", "testcases.json"), testcasesContent);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "generated", "testcases_raw.json"), JSON.stringify(testcasesRaw, null, 2));
console.log("[STAGE 4] Done -> generated/testcases.json, generated/testcases_raw.json");

//STAGE 5: Generate Playwright TypeScript tests from testcases JSON.
console.log("[STAGE 5] Generating Playwright TypeScript tests...");
const playwrightPrompt = await PromptEngine.buildPromptFromFile(
  path.resolve(process.cwd(), "prompts", "03_playwright_ts.txt"),
  { TESTCASES: testcasesContent }
);
const { content: playwrightTests } = await client.generateRaw(playwrightPrompt);
await FilesUtil.writeTextFile(path.resolve(process.cwd(), "tests", "generated.spec.ts"), playwrightTests);
console.log("[STAGE 5] Done -> tests/generated.spec.ts");

console.log("=== PIPELINE FINISHED ===");
