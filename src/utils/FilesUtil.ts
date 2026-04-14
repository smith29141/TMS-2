import { promises as fs } from "node:fs";
import path from "node:path";

export class FilesUtil {
  // Читает текст в кодировке UTF-8 из указанного пути.
  static async readTextFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch (error) {
      throw new Error(`Failed to read file "${filePath}": ${String(error)}`);
    }
  }

  // Записывает текст в UTF-8 и при необходимости создает родительские директории.
  static async writeTextFile(filePath: string, content: string): Promise<void> {
    try {
      const dirPath = path.dirname(filePath);
      await fs.mkdir(dirPath, { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
    } catch (error) {
      throw new Error(`Failed to write file "${filePath}": ${String(error)}`);
    }
  }
}
