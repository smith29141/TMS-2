import { FilesUtil } from "../utils/FilesUtil.js";

export class PromptEngine {
  // Загружает текст шаблона промпта из файла.
  static async loadTemplate(templatePath: string): Promise<string> {
    return FilesUtil.readTextFile(templatePath);
  }

  // Заменяет плейсхолдеры {{variable}} переданными значениями.
  static renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      return variables[key] ?? "";
    });
  }

  // Полный поток: читает шаблон и формирует итоговый промпт.
  static async buildPromptFromFile(
    templatePath: string,
    variables: Record<string, string>
  ): Promise<string> {
    const template = await this.loadTemplate(templatePath);
    return this.renderTemplate(template, variables);
  }
}
