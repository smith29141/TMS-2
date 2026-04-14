import path from "node:path";
import { FilesUtil } from "../utils/FilesUtil.js";
import { PromptEngine } from "./PromptEngine.js";

export interface PipelineConfig {
  templatePath: string;
  outputPath?: string;
  checklistPath?: string;
  variables?: Record<string, string>;
}

export class PipelineMain {
  // Формирует промпт из шаблона и записывает его в целевой файл.
  static async run(config: PipelineConfig): Promise<void> {
    try {
      const outputPath =
        config.outputPath ?? path.resolve(process.cwd(), "generated", "total_prompt.txt");
      const checklistPath =
        config.checklistPath ?? path.resolve(process.cwd(), "checklist_login.txt");
      const checklistContent = await FilesUtil.readTextFile(checklistPath);
      const variables = {
        CHEKLIST: checklistContent,
        ...(config.variables ?? {})
      };

      const prompt = await PromptEngine.buildPromptFromFile(config.templatePath, variables);
      await FilesUtil.writeTextFile(outputPath, prompt);
      
    } catch (error) {
      throw new Error(`Pipeline execution failed: ${String(error)}`);
    }
  }
}
