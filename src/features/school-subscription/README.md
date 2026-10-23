# School subscription

`/schools` is the "For schools" page: pricing, what a subscription includes, the business model, and a form to request a subscription.

- **Pricing** — `subscription.config.ts` holds the only price inputs: `MONTHLY_PRICE_KES` and `YEARLY_MONTHS_CHARGED`. The yearly price, free months and saving are derived from them.
- **Form** — `subscription.schema.ts` validates and normalises the fields (Kenyan phone numbers become `+254…`; the phone is the M-Pesa number that gets the payment prompt). `SubscribeForm` submits through `useSubscriptionPayment`, which drives idle → submitting → awaiting → paid / failed / timeout (or error).
- **Payments (PayHero M-Pesa)** — the browser never sees PayHero credentials. `subscription.api.ts` calls two Cloud Functions in `functions/`:
  - `createSubscriptionPayment` validates the request, rate-limits one prompt per phone per minute, computes the price server-side, writes a `pending` document to `schoolSubscriptions` and sends the STK push.
  - `getSubscriptionPaymentStatus` is polled every few seconds; once the callback is overdue it asks PayHero for the transaction status itself.
  - `payheroCallback` (served at `/api/payhero-callback` through a Hosting rewrite) only identifies the subscription; the paid/failed status always comes from PayHero's `transaction-status` endpoint, so a forged callback cannot mark a school as paid.
- **Price** — the amounts also live in `functions/src/subscription.ts`; keep them in step with `subscription.config.ts`.
- **Rules** — `firestore.rules` denies all client access to `schoolSubscriptions`; only the functions (admin access) write it, and staff read it in the Firebase console. No indexes are needed. Deploy with `firebase deploy --only firestore:rules,firestore:indexes`.
- **Setup** — copy `functions/.env.example` to `functions/.env`, store the credentials with `firebase functions:secrets:set PAYHERO_API_USERNAME` and `PAYHERO_API_PASSWORD`, then `firebase deploy --only functions,hosting`. Functions and secrets need the Firebase Blaze plan.
