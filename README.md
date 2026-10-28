# Haritha Beach Resort, Suryalanka: in-room ordering app

Guests scan a room QR (no install) to order food, track orders, ring Reception/Housekeeping, get the Wi-Fi password, see check-in
time with a running stay timer, guidelines, nearby places and helplines (English / Telugu / Hindi / Malayalam). The bar menu is view-only.
Staff (`/admin/`) get a kitchen board, requests, check-ins, menu editor, feedback, reports, printable receipts and a room-QR sheet.
Guests can also message the resort's WhatsApp number (see below).

Stack: static `public/` + one serverless function (`api/index.js` -> `lib/app.js`), Postgres on Supabase, Razorpay, WhatsApp Cloud API v25.0, hosted on Vercel.

## Local development
    npm install
    cp .env.example .env        # fill in values
    npm start                   # http://localhost:3000  (admin: /admin/)
With `DATABASE_URL` empty, a local in-process Postgres (PGlite) is used under `data/`.

## Supabase
1. Dashboard > Connect > **Transaction pooler** string -> `DATABASE_URL` (needs the database password).
2. Create the tables: `npm run db:init` (or paste `supabase/migrations/0001_init.sql` into the SQL editor). Row Level Security is enabled with no policies, so the public Supabase API cannot read these tables; the server connects directly.
3. MCP: `.mcp.json` holds the Supabase MCP server. Authenticate in a normal terminal: `claude /mcp` > supabase > Authenticate.

## Vercel
Import the GitHub repo in Vercel (Team scope: Hathras_Hst). No build step; `vercel.json` serves `public/` and routes `/api/*` and `/webhook` to the function.
Environment variables (Production): everything in `.env.example`. Bulk-push from `.env` with `scripts/vercel-env.sh`. Set `PUBLIC_URL` to the Vercel URL and a strong `ADMIN_PIN` (the app refuses admin access on Vercel without one).
CLI alternative: `npx vercel login && npx vercel link --scope Hathras_Hst && scripts/vercel-env.sh && npx vercel --prod --scope Hathras_Hst`.

## WhatsApp (Meta Cloud API)
1. `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_ACCESS_TOKEN` (use a System User permanent token), `WHATSAPP_APP_SECRET` (App settings > Basic).
2. Meta console > WhatsApp > Configuration > Webhook: Callback URL `{PUBLIC_URL}/webhook`, Verify token = `WHATSAPP_VERIFY_TOKEN`; subscribe to **messages**.
3. Guests are matched by the phone number entered at check-in. Checked-in guests can message *hi / menu / wifi / status / bill / towels / water / housekeeping / laundry / taxi / reception* or any free text (forwarded to reception). Unknown numbers get no guest info and cannot create requests.
4. Checkout feedback: set `WHATSAPP_TEMPLATE` (approved template, 2 body variables: name, link) so it can be sent outside the 24h window. Without it, plain text is sent (works only inside the window), and staff get a ready wa.me link as fallback.
5. The Meta test number can only message numbers added to the allowed recipients list.

## Razorpay
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys `rzp_test_...` while testing). Webhook: Dashboard > Settings > Webhooks, URL `{PUBLIC_URL}/api/razorpay/webhook`, events `payment.captured` and `order.paid`, secret = `RAZORPAY_WEBHOOK_SECRET`.
Receipts: `INVOICE_MODE=test` prints the merchant profile (`MERCHANT_*` env vars) with a "TEST - NOT A TAX INVOICE" marking. For real billing set `INVOICE_MODE=live` (resort name/address/GSTIN from Admin > Settings; no personal PAN is printed).

## Branding / menu
Drop the official logo at `public/logo.png` (falls back to `public/logo.svg`). The menu is sample data until the real one is imported (Admin > Menu).
