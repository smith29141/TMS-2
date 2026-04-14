import { expect, test } from "@playwright/test";
import { PiiProcessor } from "../src/security/PiiProcessor.js";

test("PiiProcessor masks sensitive values", async () => {
  const input =
    "User: john.doe@example.com, phone: +1 (555) 123-4567, password: superSecret123";

  const result = await PiiProcessor.mask(input);
  console.log(result);

  expect(result).not.toContain("john.doe@example.com");
  expect(result).not.toContain("+1 (555) 123-4567");
  expect(result).not.toContain("superSecret123");
  expect(result).toContain("EMAIL_ADDRESS");
  expect(result).toContain("PHONE_NUMBER");
  expect(result).toContain("REDACTED_SECRET");
});
