import path from "node:path";
import { FilesUtil } from "../utils/FilesUtil.js";

export interface PiiProcessorOptions {
  fixedPiiEntities?: string[];
  customRules?: Array<{ pattern: RegExp; replacement: string }>;
  nlp?: boolean;
}

export class PiiProcessor {
  private static readonly emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  private static readonly phonePattern = /\+?\d[\d\s\-()]{8,}\d/g;
  private static readonly passwordPattern = /\b(?:token|пароль|password)[:\s]*([A-Za-z0-9._-]+)/gi;
  private static readonly defaultFixedPiiEntities: string[] = ["EMAIL_ADDRESS", "PHONE_NUMBER"];
  private static readonly defaultCustomRules: Array<{ pattern: RegExp; replacement: string }> = [
    {
      pattern: this.passwordPattern,
      replacement: "REDACTED_SECRET"
    }
  ];

  private static extractMatches(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches ? [...new Set(matches)] : [];
  }

  private static async writePiiReport(text: string): Promise<void> {
    const emails = this.extractMatches(text, this.emailPattern);
    const phones = this.extractMatches(text, this.phonePattern);
    const passwords = this.extractMatches(text, this.passwordPattern);
    const toLine = (values: string[]): string => (values.length > 0 ? values.join(", ") : "-");

    const report = [
      "PII REPORTER:",
      `- EMAIL: ${toLine(emails)}`,
      `- PHONE: ${toLine(phones)}`,
      `- PASSWORD: ${toLine(passwords)}`
    ].join("\n");

    const reportPath = path.resolve(process.cwd(), "generated", "pii_report.txt");
    await FilesUtil.writeTextFile(reportPath, report);
  }

  // Маскирует чувствительные данные через библиотеку js-pii-mask.
  static async mask(text: string, options?: PiiProcessorOptions): Promise<string> {
    console.log("PII scan started...");
    const piiMaskLib = await import("@yellowsakura/js-pii-mask");
    const fixedPiiEntities = (options?.fixedPiiEntities ?? this.defaultFixedPiiEntities)
      .map((entityName) => piiMaskLib.FixedPIIEntity[entityName as keyof typeof piiMaskLib.FixedPIIEntity])
      .filter(Boolean);

    const maskedText = piiMaskLib.mask(text, {
      nlp: options?.nlp ?? false,
      fixedPiiEntities,
      customRules: [...this.defaultCustomRules, ...(options?.customRules ?? [])]
    });

    if (maskedText !== text) {
      console.log("PII detected!!! Masking PII...");
      await this.writePiiReport(text);
    } else {
      console.log("PII not detected! -> No masking required");
    }

    return maskedText;
  }
}
