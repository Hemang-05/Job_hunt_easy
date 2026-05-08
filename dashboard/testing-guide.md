# Local Testing & Environment Sync Guide

To test the payment flow and extension sync without interfering with production, follow these steps:

## 1. Expose Localhost to the Internet
Dodo Payments needs to send webhooks to your local server. Use a tunnel:
1.  Open a new terminal.
2.  Run: `npx localtunnel --port 3000` (or 3001 if your dashboard is on that port).
3.  Copy the URL provided (e.g., `https://shaggy-dogs-howl.localtunnel.me`).

## 2. Update Dodo Payments Settings
1.  Go to the [Dodo Payments Dashboard](https://app.dodopayments.com).
2.  Switch to **Test Mode**.
3.  Go to **Developers -> Webhooks**.
4.  Add a new webhook:
    - **URL**: `YOUR_TUNNEL_URL/api/webhooks/dodo`
    - **Events**: `payment.succeeded`, `subscription.active`.
5.  Update your `DODO_PAYMENTS_WEBHOOK_KEY` in `dashboard/.env.local` if it changed.

## 3. Verify Extension Config
Ensure your extension is looking at the correct local port:
1.  Check `extension/src/shared/utils.ts`.
2.  If your dashboard runs on `localhost:3001`, update the `API_BASE_URL` to `3001`.
3.  If you change the port, also update `manifest.json` under `host_permissions` to include `http://localhost:3001/*`.

## 4. Test the Flow
1.  **Dashboard**: Open `http://localhost:3000` and Sign In.
2.  **Checkout**: Go to the pricing page and click "Upgrade".
3.  **Payment**: Complete the Dodo Test checkout.
4.  **Verification**:
    - Check your terminal running `npm run dev`. You should see `[Dodo Webhook] ✅ Success`.
    - Check Supabase `profiles` table. Your `user_id` should have `plan: 'pro'`.
    - Open the Extension popup. You should see the **Pro Plan** badge.

## 5. Dev vs Production Isolation
- **Development**:
    - Dashboard: `http://localhost:3000`
    - Dodo: Test Mode
    - Supabase: Development project
- **Production**:
    - Dashboard: `https://job-hunt-easy-dashboard.vercel.app`
    - Dodo: Live Mode
    - Supabase: Production project
