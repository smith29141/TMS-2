import { config as loadEnv } from "dotenv";

export interface QwenClientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

interface QwenMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface QwenChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class QwenClient {
  private readonly apiKey: string;
  private readonly baseUrl?: string;
  private readonly model?: string;
  private readonly timeoutMs: number;

  constructor(config: QwenClientConfig) {
    this.apiKey = config.apiKey ?? process.env.QWEN_API_KEY;
    this.baseUrl = config.baseUrl ?? process.env.QWEN_BASE_URL;
    this.model = config.model ?? process.env.QWEN_MODEL;
    this.timeoutMs = config.timeoutMs ?? 60_000;
  }

  // Отправляет промпт в Qwen и возвращает сгенерированный текст.
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const { content } = await this.generateRaw(prompt, systemPrompt);
    return content;
  }

  // Отправляет промпт в Qwen и возвращает текст + полный raw JSON ответ сервера.
  async generateRaw(prompt: string, systemPrompt?: string): Promise<{ content: string; raw: QwenChatResponse }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const messages: QwenMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.model,
          messages
        }),
        signal: controller.signal
      });

      const data = (await response.json()) as QwenChatResponse;

      if (!response.ok) {
        const apiError = data.error?.message ?? response.statusText;
        throw new Error(`Qwen API request failed: ${response.status} ${apiError}`);
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Qwen API returned empty response content.");
      }

      return { content, raw: data };
    } catch (error) {
      throw new Error(`Failed to generate response from Qwen: ${String(error)}`);
    } finally {
      clearTimeout(timer);
    }
  }

  // Читает конфиг из .env; конструктор все равно применяет значения по умолчанию.
  static fromEnv(): QwenClient {
    loadEnv();

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      throw new Error("QWEN_API_KEY is not set.");
    }

    return new QwenClient({
      apiKey,
      baseUrl: process.env.QWEN_BASE_URL,
      model: process.env.QWEN_MODEL
    });
  }
}
