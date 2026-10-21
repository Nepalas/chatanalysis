# chatanalysis

(מה אורי חושב)

Upload a WhatsApp / Instagram / Messenger chat export, get a witty Hebrew AI report. The file is parsed in the browser; only a text sample and stats go to `/api/analyze`, which calls Claude and stores nothing.

    bun install && cp .env.example .env.local   # set ANTHROPIC_API_KEY
    bun run dev
    bun test

Rename the product in `lib/brand.ts`.
