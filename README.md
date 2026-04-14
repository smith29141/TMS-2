# QAL-3 — AI-Powered Test Generation Pipeline

Проект автоматически генерирует Playwright тесты с помощью LLM (через OpenRouter API) на основе чеклиста.

## Как это работает

```
checklist_login.txt
      ↓
[STAGE 1] Генерация промпта из шаблона → generated/total_prompt.txt
      ↓
[STAGE 2] PII сканирование и маскировка → generated/total_prompt.txt (masked)
      ↓
[STAGE 3] Запрос к модели → generated/ai_output.txt, generated/scenarios_raw.json
      ↓
[STAGE 4] Генерация тест-кейсов в JSON → generated/testcases.json, generated/testcases_raw.json
      ↓
[STAGE 5] Генерация Playwright TypeScript тестов → tests/generated.spec.ts
```

## Установка

```bash
npm install
npx playwright install
```

## Настройка

Создай `.env` файл в корне проекта:

```env
QWEN_API_KEY=your_api_key
QWEN_BASE_URL=https://openrouter.ai/api/v1/chat/completions
QWEN_MODEL=openrouter/auto
```

## Запуск пайплайна

```bash
npm run pipeline:run
```

## Запуск тестов

```bash
npm test
```

Запуск только сгенерированных тестов:

```bash
npx playwright test tests/generated.spec.ts
```

## Структура проекта

```
src/
  index.ts              # Точка входа, оркестрация стадий
  clients/
    QwenClient.ts       # HTTP клиент для OpenRouter/Qwen API
  core/
    PipelineMain.ts     # STAGE 1: сборка промпта
    PromptEngine.ts     # Шаблонизатор промптов
  security/
    PiiProcessor.ts     # STAGE 2: PII маскировка
  utils/
    FilesUtil.ts        # Утилиты для работы с файлами
prompts/
  01_checklist.txt      # Шаблон промпта для генерации сценариев
  02_testcases_json.txt # Шаблон промпта для генерации JSON тест-кейсов
  03_playwright_ts.txt  # Шаблон промпта для генерации Playwright тестов
generated/              # Артефакты пайплайна (gitignore)
tests/
  generated.spec.ts     # Сгенерированные тесты
```

## Требования

- Node.js >= 18.19
- TypeScript
