# Marketing Exam Prep

Учебная платформа для подготовки к экзамену по маркетингу: конспекты по 30 темам, карточки, тематические тесты, симулятор экзамена и AI-проверка пересказа через Gemini.

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Gemini AI

AI-проверка пересказа работает через серверный endpoint `POST /api/recall`, поэтому ключ не попадает в клиентский bundle.

1. Создайте `.env.local` из `.env.example`.
2. Добавьте ключ:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Если в проекте уже используется имя `NEXT_PUBLIC_GEMINI_API_KEY`, приложение тоже его прочитает на сервере как fallback, но для Vercel рекомендуется `GEMINI_API_KEY`.

## Деплой на Vercel

1. Загрузите репозиторий на GitHub/GitLab/Bitbucket.
2. В Vercel нажмите **Add New → Project** и выберите репозиторий.
3. Framework Preset: **Next.js**.
4. В **Settings → Environment Variables** добавьте:
   - `GEMINI_API_KEY` — ваш Gemini API key.
5. Нажмите **Deploy**.

Команды сборки уже описаны в `vercel.json`:

```bash
npm install
npm run build
```

## Скрипты

```bash
npm run dev    # запуск тестового режима
npm run build  # production build для Vercel
npm run start  # запуск production build
npm run lint   # ESLint
```
